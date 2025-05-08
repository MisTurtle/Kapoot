import { BaseGameSocketHandler } from "@common/game_socket_handler";
import { deserialize_component, QuestionComponent } from "@common/quizz_components/components";
import { Dispatch, SetStateAction } from "react";

export default class ClientGameSocketHandler extends BaseGameSocketHandler
{
    private timer?: NodeJS.Timeout;

    constructor(
        private socket: WebSocket,
        private showError: (err: string) => void,
        private setPlayers: Dispatch<SetStateAction<SharedGamePlayer[]>>,
        private setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>,
        private spawnEmote: (emote: number) => void,
        private setShowingLeaderboard: Dispatch<SetStateAction<boolean>>,
        private setCurrentQuestion: Dispatch<SetStateAction<QuestionComponent<BaseQuestionProps> | undefined>>,
        private setEnded: Dispatch<SetStateAction<boolean>>,
        private setAnswers: Dispatch<SetStateAction<number[]>>,
        private setTimerValue: Dispatch<SetStateAction<number>>,
        private setMyAnswer: Dispatch<SetStateAction<number | undefined>>,
        private setCorrectAnswer: Dispatch<SetStateAction<number | undefined>>,
        private setCurrentRank: Dispatch<SetStateAction<number | undefined>>
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
                console.error(err);
            }
        };
        this.socket.onerror = (err) => {
            // this.showError("Websocket error occurred");
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
        this.setCorrectAnswer(packet.prev_answer);
        clearInterval(this.timer);
        this.setTimerValue(0);
        this.setEnded(packet.ended);
        if(packet.rank !== undefined) this.setCurrentRank(packet.rank);
        this.setShowingLeaderboard(true);
    }
    onShowNewQuestion(packet: QuestionChangeSockMsg): void {
        const q = deserialize_component(packet.question) as QuestionComponent<BaseQuestionProps>;
        if(!q) throw new Error("Quizz deserialization error");

        this.setAnswers([]);
        this.setMyAnswer(undefined);
        this.setCorrectAnswer(undefined);

        this.setCurrentQuestion(q);
        this.setShowingLeaderboard(false);
        this.setTimerValue(packet.time_override ?? q.get('time_limit') ?? 15);
        
        clearInterval(this.timer);
        this.timer = setInterval(() => { this.setTimerValue(prev => prev - 1) }, 1000);
    }

    onUserAnswers(packet: PlayerAnswerSockMsg): void {
        throw new Error("This packet should not be received by a client.");
    }
    addOneAnswer(packet: SomeUserAnsweredSockMsg): void {
        this.setAnswers(packet.answers);
    }

    // Player Controls //
    submitAnswer(answer: number) {
        this.setMyAnswer(answer);
        this.send({ 'type': 'user_answer', 'answer': answer });
    }

    // Owner Controls //
    startGame(): void { this.send({ 'type': 'owner_start_game' }); }
    nextQuestion(): void { this.send({ 'type': 'owner_next_question' }); }
    stopEarly(): void { this.send({ 'type': 'owner_stop_early' }); clearInterval(this.timer); }
}
