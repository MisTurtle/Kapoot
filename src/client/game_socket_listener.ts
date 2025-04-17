type GameSockMsgMap = {
    [M in GameSockMsg as M["type"]]: M;
};

export default abstract class GameSocketListener
{
    handle(packet: GameSockMsg): void
    {
        const fnMap: { [K in keyof GameSockMsgMap]: (msg: GameSockMsgMap[K]) => void } = {
            'player_joined': this.onPlayerJoin,
            'player_left': this.onPlayerLeft,
            'chat_msg': this.onChatMessage,
            'emote': this.onEmote
        };
    }

    abstract onPlayerJoin(packet: PlayerJoinSockMsg): void;
    abstract onPlayerLeft(packet: PlayerLeftSockMsg): void;
    abstract onChatMessage(packet: ChatMessageSockMsg): void;
    abstract onEmote(packet: EmoteSockMsg): void;
}
