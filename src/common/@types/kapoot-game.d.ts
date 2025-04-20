import { SimpleQuestionComponent, SimpleQuizzComponent } from "@common/quizz_components/components";

declare global {

    type GameIdentifier = number;

    type GamePageInitiatorValues = {
        id: GameIdentifier;
        owner: GamePlayer;
        self: GamePlayer;
        players: GamePlayer[];
    };

    type GameSettings = { };

    type ChatMessage = {
        user?: GamePlayer,
        cnt: string
    };
    type Emote = number;

    type EmoteData = {
        id: number;
        type: number;
        left: number;
        bottom: number;
        drift: number;
        rotation: number;
      };

}

export {};
