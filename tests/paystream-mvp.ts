import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PaymentStream } from "../target/types/payment_stream";
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("payment_stream", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PaymentStream as Program<PaymentStream>;
  const authority = provider.wallet;

  let streamAccount: PublicKey;
  let streamAccountBump: number;
  let receiver: Keypair;

  before(async () => {
    [streamAccount, streamAccountBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("stream"), authority.publicKey.toBuffer()],
      program.programId
    );
    receiver = Keypair.generate();
  });

  it("Initializes the stream account", async () => {
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize transaction signature", tx);
    } catch (error) {
      // If the account is already initialized, this is fine
      if (!error.message.includes("already in use")) {
        throw error;
      }
    }

    const account = await program.account.streamAccount.fetch(streamAccount);
    assert.ok(account.authority.equals(authority.publicKey), "Authority should match");
  });

  it("Creates multiple streams", async () => {
    const numStreams = 3;
    for (let i = 0; i < numStreams; i++) {
      try {
        const duration = new anchor.BN(3600 * (i + 1)); // Increasing durations
        const amount = new anchor.BN(LAMPORTS_PER_SOL / 100 * (i + 1)); // Increasing amounts

        const tx = await program.methods
          .createStream(receiver.publicKey, duration, amount)
          .accounts({
            streamAccount: streamAccount,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log(`Create stream ${i + 1} transaction signature`, tx);

        const account = await program.account.streamAccount.fetch(streamAccount);
        assert.equal(account.streams.length, i + 1, `Streams array should have ${i + 1} element(s)`);

        const stream = account.streams[i];
        assert.ok(stream.sender.equals(authority.publicKey), "Sender should match");
        assert.ok(stream.receiver.equals(receiver.publicKey), "Receiver should match");
        assert.equal(stream.amount.toNumber(), amount.toNumber(), "Amount should match");
        assert.equal(stream.withdrawnAmount.toNumber(), 0, "Withdrawn amount should be 0");
        assert.equal(stream.isActive, true, "Stream should be active");
      } catch (error) {
        console.error(`Error in creating stream ${i + 1}:`, error);
        throw error;
      }
    }
  });

  it("Cancels a stream", async () => {
    try {
      const tx = await program.methods
        .cancelStream(new anchor.BN(0))
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Cancel stream transaction signature", tx);

      const account = await program.account.streamAccount.fetch(streamAccount);
      const stream = account.streams[0];
      assert.equal(stream.isActive, false, "Stream should be inactive after cancellation");
    } catch (error) {
      console.error("Error in cancelling stream:", error);
      throw error;
    }
  });

  it("Fails to cancel an already cancelled stream", async () => {
    try {
      await program.methods
        .cancelStream(new anchor.BN(0))
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      assert.fail("Cancelling an already cancelled stream should have failed");
    } catch (error) {
      assert.include(error.message, "StreamInactive", "Error should indicate that the stream is inactive");
    }
  });

  it("Cancels a stream before its duration ends", async () => {
    // Create a new stream with 10 second duration
    const duration = new anchor.BN(10); // 10 seconds
    const amount = new anchor.BN(LAMPORTS_PER_SOL / 100); // 0.01 SOL

    const createTx = await program.methods
      .createStream(receiver.publicKey, duration, amount)
      .accounts({
        streamAccount: streamAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Create stream transaction signature", createTx);

    // Get the current stream count
    const accountBeforeCancel = await program.account.streamAccount.fetch(streamAccount);
    const streamIndex = accountBeforeCancel.streams.length - 1; // Index of the newly created stream

    // Check if the stream is active
    assert.equal(accountBeforeCancel.streams[streamIndex].isActive, true, "Stream should be active after creation");

    // Cancel the stream immediately
    try {
      const cancelTx = await program.methods
        .cancelStream(new anchor.BN(streamIndex))
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Cancel stream transaction signature", cancelTx);

      // Check if the stream is cancelled
      const accountAfterCancel = await program.account.streamAccount.fetch(streamAccount);
      const cancelledStream = accountAfterCancel.streams[streamIndex];
      assert.equal(cancelledStream.isActive, false, "Stream should be inactive after cancellation");
    } catch (error) {
      console.error("Error in cancelling stream:", error);
      throw error;
    }
  });
});
