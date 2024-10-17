use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_lang::solana_program::system_instruction;

declare_id!("GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn");

#[program]
pub mod paystream_mvp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let stream_account = &mut ctx.accounts.stream_account;
        stream_account.authority = ctx.accounts.authority.key();
        stream_account.stream_count = 0;
        stream_account.streams = Vec::new(); // Initialize the vector
        Ok(())
    }

    pub fn create_stream(
        ctx: Context<CreateStream>,
        receiver: Pubkey,
        duration: i64,
        amount: u64,
    ) -> Result<()> {
        let stream_account = &mut ctx.accounts.stream_account;
        
        let clock = Clock::get()?;

        let stream = Stream {
            sender: ctx.accounts.authority.key(),
            receiver,
            start_time: clock.unix_timestamp,
            end_time: clock.unix_timestamp + duration,
            amount,
            withdrawn_amount: 0,
            is_active: true,
        };

        stream_account.streams.push(stream);
        stream_account.stream_count += 1;

        // Transfer SOL to the stream account
        let transfer_instruction = system_instruction::transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.stream_account.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.stream_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn cancel_stream(ctx: Context<CancelStream>, stream_index: u64) -> Result<()> {
        let stream_account = &ctx.accounts.stream_account;
        let stream = &stream_account.streams[stream_index as usize];

        require!(stream.is_active, ErrorCode::StreamInactive);
        require!(
            stream.sender == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        let elapsed_time = current_time - stream.start_time;
        let total_time = stream.end_time - stream.start_time;

        let withdrawable_amount = (stream.amount as u128)
            .checked_mul(elapsed_time as u128)
            .unwrap()
            .checked_div(total_time as u128)
            .unwrap() as u64;

        let refund_amount = stream.amount.checked_sub(withdrawable_amount).unwrap();

        // Transfer withdrawable amount to receiver
        if withdrawable_amount > 0 {
            **ctx.accounts.stream_account.to_account_info().try_borrow_mut_lamports()? -= withdrawable_amount;
            **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? += withdrawable_amount;
        }

        // Refund remaining amount to sender
        if refund_amount > 0 {
            **ctx.accounts.stream_account.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
            **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += refund_amount;
        }

        // Update stream state
        let stream_account = &mut ctx.accounts.stream_account;
        let stream = &mut stream_account.streams[stream_index as usize];
        stream.is_active = false;
        stream.withdrawn_amount = withdrawable_amount;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, stream_index: u64) -> Result<()> {
        let stream_account = &ctx.accounts.stream_account;
        let stream = &stream_account.streams[stream_index as usize];

        require!(stream.is_active, ErrorCode::StreamInactive);
        require!(
            stream.receiver == ctx.accounts.receiver.key(),
            ErrorCode::Unauthorized
        );

        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        let elapsed_time = current_time - stream.start_time;
        let total_time = stream.end_time - stream.start_time;

        let withdrawable_amount = (stream.amount as u128)
            .checked_mul(elapsed_time as u128)
            .unwrap()
            .checked_div(total_time as u128)
            .unwrap() as u64;

        let amount_to_withdraw = withdrawable_amount.checked_sub(stream.withdrawn_amount).unwrap();

        if amount_to_withdraw > 0 {
            **ctx.accounts.stream_account.to_account_info().try_borrow_mut_lamports()? -= amount_to_withdraw;
            **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? += amount_to_withdraw;

            // Update stream state
            let stream_account = &mut ctx.accounts.stream_account;
            let stream = &mut stream_account.streams[stream_index as usize];
            stream.withdrawn_amount = stream.withdrawn_amount.checked_add(amount_to_withdraw).unwrap();

            if current_time >= stream.end_time {
                stream.is_active = false;
            }
        }

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Stream {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub amount: u64,
    pub withdrawn_amount: u64,
    pub is_active: bool,
}

#[account]
pub struct StreamAccount {
    pub authority: Pubkey,
    pub stream_count: u64,
    pub streams: Vec<Stream>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + (32 + 32 + 8 + 8 + 8 + 8 + 1) * 20, // Increased to 20 streams
        seeds = [b"stream", authority.key().as_ref()],
        bump
    )]
    pub stream_account: Account<'info, StreamAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStream<'info> {
    #[account(
        mut,
        seeds = [b"stream", authority.key().as_ref()],
        bump
    )]
    pub stream_account: Account<'info, StreamAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelStream<'info> {
    #[account(
        mut,
        seeds = [b"stream", authority.key().as_ref()],
        bump
    )]
    pub stream_account: Account<'info, StreamAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: This is safe because we're only transferring SOL to this account
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"stream", authority.key().as_ref()],
        bump
    )]
    pub stream_account: Account<'info, StreamAccount>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub receiver: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The stream is inactive")]
    StreamInactive,
    #[msg("Unauthorized access")]
    Unauthorized,
}