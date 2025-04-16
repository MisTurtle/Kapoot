declare global {
    
    type QuizzIdentifier = string;

    type SerializedQuizz = {
        quizz_id: QuizzIdentifier;
        params: string;
        created_at: string;
        updated_at: string;
    };

}

export {};
