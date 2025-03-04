declare global {
    type UserIdentifier = (
        | { username: string; identifier?: string; mail?: string; }
        | { username?: string; identifier: string; mail?: string; }
        | { username?: string; identifier?: string; mail: string; }
    );

    type AccountDetails = {
        username: string,
        mail: string,
        // TODO : Add more information about the user
    }
}

export {};
