import { SimpleQuestionComponent } from "@common/quizz_components/components";

declare global {

    type GameIdentifier = number;

    type SharedGameValues = {
        id: GameIdentifier;
        owner: GamePlayer;
        quizz: SimpleQuestionComponent; // TODO : Make this only the required data (current question or some other stuff in the lobby and end game)  =>  Make a separate type
        players: GamePlayer[];
    };

    type GameSettings = { };

}

export {};
