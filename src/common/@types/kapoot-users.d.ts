declare global {
    type UserIdentifier = (
        | { username: string; identifier?: string; mail?: string; }
        | { username?: string; identifier: string; mail?: string; }
        | { username?: string; identifier?: string; mail: string; }
    );

    type AccountDetails = {
        uuid: string;
        username: string;
        mail: string;
        avatar: string;
        // TODO : Add more information about the user
    };
}

export {};