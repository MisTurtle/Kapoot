// import { BaseGameSocketHandler } from "@common/game_socket_handler";

// export default class ServerGameSocketHandler extends BaseGameSocketHandler
// {

//     constructor(
//         private getAllSockets: () => WebSocket[],
//         private getAllPlayers: () => GamePlayer[]
//     ) {
//         super();
//     }

//     send(packet: GameSockMsg): void;
//     send(packet: GameSockMsg, targets: WebSocket[]): void;
//     send(packet: GameSockMsg, targets?: WebSocket[]): void
//     {
//         (targets ?? this.getAllSockets()).forEach(sock => sock.send(JSON.stringify(packet)));
//     }

//     sendJoinPacket(): void {
//         this.send({ 'type': 'player_joined', 'players': this.getAllPlayers() });
//     }
//     onPlayerJoin(packet: PlayerJoinSockMsg): void {
//         this.sendJoinPacket();
//     }

//     sendLeftPacket(): void {
//         this.send({ 'type': 'player_left', 'players': this.getAllPlayers() });
//     }
//     onPlayerLeft(packet: PlayerLeftSockMsg): void {
//         this.sendLeftPacket();
//     }

//     sendChatMessagePacket(msg: string): void {
//         throw new Error("Method not implemented.");
//     }
//     onChatMessage(packet: ChatMessageSockMsg): void {
//         throw new Error("Method not implemented.");
//     }

//     sendEmote(emote: number): void {
//         throw new Error("Method not implemented.");
//     }
//     onEmote(packet: EmoteSockMsg): void {
//         throw new Error("Method not implemented.");
//     }
// }
