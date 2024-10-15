import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { payment_stream } from "../target/types/payment_stream";
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("payment_stream", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.payment_stream as Program<payment_stream>;
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

    // Airdrop some SOL to the authority for testing
    const signature = await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature);
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

      const account = await program.account.streamAccount.fetch(streamAccount);
      assert.ok(account.authority.equals(authority.publicKey), "Authority should match");
      assert.equal(account.streamCount.toNumber(), 0, "Initial stream count should be 0");
    } catch (error) {
      console.error("Error in initializing stream account:", error);
      throw error;
    }
  });

  it("Creates a stream", async () => {
    try {
      const duration = new anchor.BN(3600); // 1 hour
      const amount = new anchor.BN(LAMPORTS_PER_SOL / 100); // 0.01 SOL

      const tx = await program.methods
        .createStream(receiver.publicKey, duration, amount)
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Create stream transaction signature", tx);

      const account = await program.account.streamAccount.fetch(streamAccount);
      assert.equal(account.streamCount.toNumber(), 1, "Stream count should be 1");
      assert.equal(account.streams.length, 1, "Streams array should have 1 element");
      
      const stream = account.streams[0];
      assert.ok(stream.sender.equals(authority.publicKey), "Sender should match");
      assert.ok(stream.receiver.equals(receiver.publicKey), "Receiver should match");
      assert.equal(stream.amount.toNumber(), amount.toNumber(), "Amount should match");
      assert.equal(stream.withdrawnAmount.toNumber(), 0, "Withdrawn amount should be 0");
      assert.equal(stream.isActive, true, "Stream should be active");
    } catch (error) {
      console.error("Error in creating stream:", error);
      throw error;
    }
  });

  it("Withdraws from a stream", async () => {
    try {
      // Wait for some time to pass
      await new Promise(resolve => setTimeout(resolve, 1000));

      const initialReceiverBalance = await provider.connection.getBalance(receiver.publicKey);

      const tx = await program.methods
        .withdraw(new anchor.BN(0))
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([receiver])
        .rpc();

      console.log("Withdraw transaction signature", tx);

      const newReceiverBalance = await provider.connection.getBalance(receiver.publicKey);
      assert.isAbove(newReceiverBalance, initialReceiverBalance, "Receiver balance should have increased");

      const account = await program.account.streamAccount.fetch(streamAccount);
      const stream = account.streams[0];
      assert.isAbove(stream.withdrawnAmount.toNumber(), 0, "Withdrawn amount should be greater than 0");
      assert.equal(stream.isActive, true, "Stream should still be active");
    } catch (error) {
      console.error("Error in withdrawing from stream:", error);
      throw error;
    }
  });

  it("Cancels a stream", async () => {
    try {
      const initialAuthBalance = await provider.connection.getBalance(authority.publicKey);
      const initialReceiverBalance = await provider.connection.getBalance(receiver.publicKey);

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

      const newAuthBalance = await provider.connection.getBalance(authority.publicKey);
      const newReceiverBalance = await provider.connection.getBalance(receiver.publicKey);

      assert.isAbove(newAuthBalance, initialAuthBalance, "Authority balance should have increased due to refund");
      assert.isAbove(newReceiverBalance, initialReceiverBalance, "Receiver balance should have increased due to partial payout");

      const account = await program.account.streamAccount.fetch(streamAccount);
      const stream = account.streams[0];
      assert.equal(stream.isActive, false, "Stream should be inactive after cancellation");
    } catch (error) {
      console.error("Error in cancelling stream:", error);
      throw error;
    }
  });

  it("Fails to withdraw from an inactive stream", async () => {
    try {
      await program.methods
        .withdraw(new anchor.BN(0))
        .accounts({
          streamAccount: streamAccount,
          authority: authority.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([receiver])
        .rpc();

      assert.fail("Withdrawing from an inactive stream should have failed");
    } catch (error) {
      assert.include(error.message, "StreamInactive", "Error should indicate that the stream is inactive");
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
});