import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PaystreamMvp } from "../target/types/paystream_mvp";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("paystream-mvp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PaystreamMvp as Program<PaystreamMvp>;
  const authority = provider.wallet.publicKey;

  let streamAccountPda: PublicKey;
  let streamAccountBump: number;

  before(async () => {
    [streamAccountPda, streamAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("stream"), authority.toBuffer()],
      program.programId
    );
  });

  it("Initializes the stream account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        streamAccount: streamAccountPda,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const streamAccount = await program.account.streamAccount.fetch(streamAccountPda);

    expect(streamAccount.authority.toString()).to.equal(authority.toString());
    expect(streamAccount.streamCount.toNumber()).to.equal(0);
    expect(streamAccount.streams).to.be.an("array").that.is.empty;
  });

  it("Creates a stream", async () => {
    const receiver = anchor.web3.Keypair.generate().publicKey;
    const duration = new anchor.BN(3600); // 1 hour
    const amount = new anchor.BN(1_000_000_000); // 1 SOL

    const tx = await program.methods
      .createStream(receiver, duration, amount)
      .accounts({
        streamAccount: streamAccountPda,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const streamAccount = await program.account.streamAccount.fetch(streamAccountPda);

    expect(streamAccount.streamCount.toNumber()).to.equal(1);
    expect(streamAccount.streams).to.have.lengthOf(1);

    const stream = streamAccount.streams[0];
    expect(stream.sender.toString()).to.equal(authority.toString());
    expect(stream.receiver.toString()).to.equal(receiver.toString());
    expect(stream.amount.toNumber()).to.equal(amount.toNumber());
    expect(stream.withdrawnAmount.toNumber()).to.equal(0);
    expect(stream.isActive).to.be.true;

    // Check that the end time is approximately correct (allowing for a small margin of error)
    const currentTime = Math.floor(Date.now() / 1000);
    expect(stream.endTime.toNumber()).to.be.closeTo(currentTime + duration.toNumber(), 5);
  });
});

