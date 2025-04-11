class Player 
{
    account: AccountDetails | undefined;
    cosmetics: AccountCosmetics;

    constructor(account: AccountDetails | undefined, cosmetics: AccountCosmetics)
    {
        this.account = account;
        this.cosmetics = cosmetics;
    }
}