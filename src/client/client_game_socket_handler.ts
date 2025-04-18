import { BaseGameSocketHandler } from "@common/game_socket_handler";
import { Dispatch, RefObject, SetStateAction } from "react";

export default class ClientGameSocketHandler extends BaseGameSocketHandler
{

    constructor(
        private socket: WebSocket,
        private showError: (err: string) => void,
        private setPlayers: Dispatch<SetStateAction<GamePlayer[]>>,
        private setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>,
        private spawnEmote: (emote: number) => void
    ) {
        super();
        this.setupSocket();
    }

    private setupSocket()
    {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            try{
                this.handle(message);
            } catch(err) {
                this.showError(`Invalid socket message '${message.type}'`);
            }
        };
        this.socket.onerror = (err) => {
            this.showError("Websocket error occurred");
            console.error(err);
        };
    }
    send(packet: GameSockMsg) { this.socket.send(JSON.stringify(packet)); }

    onPlayerJoin(packet: PlayerJoinSockMsg): void {
        this.setPlayers(packet.players);
    }
    sendJoinPacket(): void {
        this.send({ 'type': 'player_joined', players: [] });
    }

    onPlayerLeft(packet: PlayerLeftSockMsg): void {
        this.setPlayers(packet.players);
    }
    sendLeftPacket(): void {
        this.send({ 'type': 'player_left', players: [] });
    }

    onChatMessage(packet: ChatMessageSockMsg): void {
        console.log("OnChatMessage called.");
        this.setChatMessages(prev => [packet.msg].concat(prev.slice(0, 9)));
    }
    sendChatMessagePacket(cnt: string): boolean {
        const trimmed = cnt.trim();
        if (!trimmed || !this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
        this.send({ type: "chat_msg", msg: { cnt: trimmed } });
        return true;
    }

    onEmote(packet: EmoteSockMsg): void {
        this.spawnEmote(packet.emote);
    }
    sendEmote(emote: Emote): void {
        this.send({ 'type': 'emote', 'emote': emote });
    }
}
