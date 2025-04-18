declare global {

    type BaseGameSockMsg = { type: string };

    type PlayerJoinSockMsg = { type: "player_joined", players: GamePlayer[] };
    type PlayerLeftSockMsg = { type: "player_left", players: GamePlayer[] };
    type ChatMessageSockMsg = { type: "chat_msg", msg: ChatMessage };
    type EmoteSockMsg = { type: "emote", emote: Emote };

    type GameSockMsg = PlayerJoinSockMsg | PlayerLeftSockMsg | ChatMessageSockMsg | EmoteSockMsg;
}

export {};
