type GameSockMsgMap = {
    [M in GameSockMsg as M["type"]]: M;
};

export abstract class BaseGameSocketHandler
{
    private readonly fnMap: { [K in keyof GameSockMsgMap]: (packet: GameSockMsgMap[K]) => void } = {
        'player_joined': this.onPlayerJoin.bind(this),
        'player_left': this.onPlayerLeft.bind(this),
        'chat_msg': this.onChatMessage.bind(this),
        'emote': this.onEmote.bind(this),
        'leaderboard': this.onShowLeaderboard.bind(this),
        'new_question': this.onShowNewQuestion.bind(this),
        'user_answer': this.onUserAnswers.bind(this),
        'update_answer_count': this.addOneAnswer.bind(this)
    };

    handle(packet: GameSockMsg): void { this.fnMap[packet.type](packet as any); }

    abstract sendJoinPacket(): void;
    abstract onPlayerJoin(packet: PlayerJoinSockMsg): void;

    abstract sendLeftPacket(): void;
    abstract onPlayerLeft(packet: PlayerLeftSockMsg): void;

    abstract sendChatMessagePacket(msg: string): void;
    abstract onChatMessage(packet: ChatMessageSockMsg): void;

    abstract sendEmote(emote: number): void;
    abstract onEmote(packet: EmoteSockMsg): void;

    abstract onShowLeaderboard(packet: ShowLeaderboardSockMsg): void;
    abstract onShowNewQuestion(packet: QuestionChangeSockMsg): void;

    abstract onUserAnswers(packet: PlayerAnswerSockMsg): void;
    abstract addOneAnswer(packet: SomeUserAnsweredSockMsg): void;
}