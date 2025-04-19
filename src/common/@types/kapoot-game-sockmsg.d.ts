import { QuestionComponent } from "@common/quizz_components/components";

declare global {

    type BaseGameSockMsg = { type: string };

    /** Player Events */
    type PlayerJoinSockMsg = { type: "player_joined", players: GamePlayer[] };
    type PlayerLeftSockMsg = { type: "player_left", players: GamePlayer[] };
    type ChatMessageSockMsg = { type: "chat_msg", msg: ChatMessage };
    type EmoteSockMsg = { type: "emote", emote: Emote };
    type PlayerAnswerSockMsg = { type: "user_answer", answer: number };

    /** Game Events */
    type QuestionChangeSockMsg = { type: "new_question", question: QuestionComponent };
    type ShowLeaderboardSockMsg = { type: "leaderboard", players: GamePlayer[], ended: boolean };
    type SomeUserAnsweredSockMsg = { type: "add_one_answer" };

    type GameSockMsg = PlayerJoinSockMsg | PlayerLeftSockMsg | ChatMessageSockMsg | EmoteSockMsg | PlayerAnswerSockMsg | QuestionChangeSockMsg | ShowLeaderboardSockMsg | SomeUserAnsweredSockMsg;


    /** Owner Commands */
    type StartGameSockMsg = { type: "owner_start_game" };
    type NextQuestionSockMsg = { type: "owner_next_question" };
    type StopEarlySockMsg = { type: "owner_stop_early" };

    type GameOwnerCommandSockMsg = StartGameSockMsg | NextQuestionSockMsg | StopEarlySockMsg;

}

export {};
