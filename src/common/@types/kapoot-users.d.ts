declare global {
    type UserIdentifier = (
        | { username: string; identifier?: string; mail?: string; }
        | { username?: string; identifier: string; mail?: string; }
        | { username?: string; identifier?: string; mail: string; }
    );
    type AccountCosmetics = {
        username?: string;
        avatar?: string;
    }
    type AccountStatistics = {
        // TODO
    };
    type AccountDetails = UserIdentifier & AccountCosmetics & AccountStatistics;

    type GamePlayerIdentifier = { sessionId: string, accountId?: string };
    type GamePlayer = GamePlayerIdentifier & { 
        currentGame?: GameIdentifier,
        sockets?: WebSocket[]
    } & AccountCosmetics;
}

export {};