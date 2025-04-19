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
        quizzes_created: int,
        games_played: int,
        total_points: int 
    };
    type AccountDetails = UserIdentifier & AccountCosmetics & AccountStatistics;

    type GamePlayerIdentifier = { sessionId: string, accountId?: string };
    type GamePlayer = GamePlayerIdentifier & { 
        currentGame?: GameIdentifier,
        points?: number,
        sockets?: WebSocket[]
    } & AccountCosmetics;
}

export {};