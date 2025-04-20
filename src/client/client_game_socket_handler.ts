import { BaseGameSocketHandler } from "@common/game_socket_handler";
import { deserialize_component, QuestionComponent } from "@common/quizz_components/components";
import { Dispatch, RefObject, SetStateAction } from "react";

export default class ClientGameSocketHandler extends BaseGameSocketHandler
{
    constructor(
        private socket: WebSocket,
        private showError: (err: string) => void,
        private setPlayers: Dispatch<SetStateAction<GamePlayer[]>>,
        private setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>,
        private spawnEmote: (emote: number) => void,
        private setShowingLeaderboard: Dispatch<SetStateAction<boolean>>,
        private setCurrentQuestion: Dispatch<SetStateAction<QuestionComponent<BaseQuestionProps> | undefined>>,
        private setEnded: Dispatch<SetStateAction<boolean>>,
        private setAnswers: Dispatch<SetStateAction<number[]>>
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
    send(packet: GameSockMsg | GameOwnerCommandSockMsg) { this.socket.send(JSON.stringify(packet)); }

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
    
    onShowLeaderboard(packet: ShowLeaderboardSockMsg): void {
        this.setPlayers(packet.players);
        this.setShowingLeaderboard(true);
        this.setEnded(packet.ended);
    }
    onShowNewQuestion(packet: QuestionChangeSockMsg): void {
        this.setAnswers([]);
        this.setCurrentQuestion(deserialize_component(packet.question) as QuestionComponent<BaseQuestionProps>);
        this.setShowingLeaderboard(false);
    }

    onUserAnswers(packet: PlayerAnswerSockMsg): void {
        throw new Error("This packet should not be received by a client.");
    }
    addOneAnswer(packet: SomeUserAnsweredSockMsg): void {
        this.setAnswers(packet.answers);
    }

    // Player Controls //
    submitAnswer(answer: number) {this.send({ 'type': 'user_answer', 'answer': answer }); }

    // Owner Controls //
    startGame(): void { this.send({ 'type': 'owner_start_game' }); }
    nextQuestion(): void { this.send({ 'type': 'owner_next_question' }); }
    stopEarly(): void { this.send({ 'type': 'owner_stop_early' }); }
}
