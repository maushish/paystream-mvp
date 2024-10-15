use anchor_lang::prelude::*;

declare_id!("8GD6xLzi3D2CT53EYxZ2iW16Xf7ByoKqv4VMJSRuRRXS");

#[program]
pub mod paystream_mvp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
