import { QuestionComponent } from "@common/quizz_components/components";

declare global {

    type BaseGameSockMsg = { type: string };

    /** Player Events */
    type PlayerJoinSockMsg = { type: "player_joined", players: SharedGamePlayer[] };
    type PlayerLeftSockMsg = { type: "player_left", players: SharedGamePlayer[] };
    type ChatMessageSockMsg = { type: "chat_msg", msg: ChatMessage };
    type EmoteSockMsg = { type: "emote", emote: Emote };
    type PlayerAnswerSockMsg = { type: "user_answer", answer: number };

    /** Game Events */
    type QuestionChangeSockMsg = { type: "new_question", question: QuestionComponent, time_override?: number };
    type ShowLeaderboardSockMsg = { type: "leaderboard", players: SharedGamePlayer[], rank?: number, prev_answer: number, ended: boolean };
    type SomeUserAnsweredSockMsg = { type: "update_answer_count", answers: number[] };

    type GameSockMsg = PlayerJoinSockMsg | PlayerLeftSockMsg | ChatMessageSockMsg | EmoteSockMsg | PlayerAnswerSockMsg | QuestionChangeSockMsg | ShowLeaderboardSockMsg | SomeUserAnsweredSockMsg;


    /** Owner Commands */
    type StartGameSockMsg = { type: "owner_start_game" };
    type NextQuestionSockMsg = { type: "owner_next_question" };
    type StopEarlySockMsg = { type: "owner_stop_early" };

    type GameOwnerCommandSockMsg = StartGameSockMsg | NextQuestionSockMsg | StopEarlySockMsg;

}

export {};
