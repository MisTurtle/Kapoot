declare global {
    type UserIdentifier = (
        | { username: string; identifier?: string; mail?: string; }
        | { username?: string; identifier: string; mail?: string; }
        | { username?: string; identifier?: string; mail: string; }
    );

    type SerializedQuizz = {
        quizz_id: string;
        params: string;
        created_at: string;
        updated_at: string;
    };

    type AccountDetails = {
        username: string,
        mail: string,
        // TODO : Add more information about the user
    };

    type QuizzIdentifier = string;
}

export {};
