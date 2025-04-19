import { SimpleQuizzComponent } from "@common/quizz_components/components";

export default class Game
{
    private _id: GameIdentifier;
    private _owner: GamePlayer;
    private _quizz: SimpleQuizzComponent;
    private _settings: GameSettings;
    private _players: GamePlayer[];

    constructor(id: GameIdentifier, owner: GamePlayer, quizz: SimpleQuizzComponent, settings: GameSettings)
    {
        this._id = id;
        owner.currentGame = id;
        this._owner = owner;
        this._quizz = quizz;
        this._settings = settings;
        this._players = [];
    }

    get id() { return this._id; }
    
    get everyone(): GamePlayer[]
    {
        return this._players.concat([this._owner]);
    }
    get players(): GamePlayer[]
    {
        return this._players;
    }
    get owner(): GamePlayer
    {
        return this._owner;
    }

    get playerSockets(): WebSocket[]
    {
        return this._players.map(p => p.sockets ?? []).flatMap(socks => socks ?? []); 
    }

    get ownerSockets(): WebSocket[]
    {
        return this._owner.sockets ?? [];
    }

    get allSockets(): WebSocket[]
    {
        return this.ownerSockets.concat(this.playerSockets);
    }

    equals(p1: GamePlayer, p2: GamePlayer)
    {
        return (
            (p1.accountId !== undefined && p1.accountId === p2.accountId) ||
            (p1.sessionId !== undefined && p1.sessionId === p2.sessionId)
        ); 
    }

    isOwner(user: GamePlayerIdentifier): boolean
    {
        return user.accountId !== undefined && this._owner.accountId === user.accountId;
    }

    contains(user: GamePlayerIdentifier): boolean
    {
        return this.get(user) !== undefined;
    }

    get(user: GamePlayerIdentifier): GamePlayer | undefined
    {
        if(this.isOwner(user)) return this._owner;

        return this._players.find(p => this.equals(user, p));
    }

    add(user: GamePlayer): boolean
    {
        if(this.get(user)) return false;

        user.currentGame = this._id;
        this._players.push(user);
        this.broadcast({ 'type': 'player_joined', 'players': this.players });

        return true;
    }

    addSockets(user: GamePlayer): boolean
    {
        var prevUser = this.get(user);
        if(!prevUser) return false;
        prevUser.sockets = (prevUser.sockets ?? []).concat(user.sockets ?? []).filter((value, index, array) => array.indexOf(value) === index);
        return true;
    }

    remove(user: GamePlayer): boolean
    {
        if(!this.get(user)) return false;
        
        this._players = this._players.filter(p => !this.equals(p, user));
        this.broadcast({ 'type': 'player_left', 'players': this.everyone });

        return true;
    }

    removeSockets(sockets: WebSocket[])
    {
        this.everyone.forEach(player => {
            player.sockets = (player.sockets ?? []).filter(sock => !sockets.includes(sock));
        });
    }

    chat(user: GamePlayer, msg: ChatMessage): boolean
    {
        if(!this.get(user)) return false;
        this.broadcast({ 'type': 'chat_msg', 'msg': { 'user': user, 'cnt': msg.cnt ?? "" }});
        return true;
    }

    emote(user: GamePlayer, emote: number): boolean
    {
        if(!this.get(user)) return false;
        this.broadcast({ 'type': 'emote', 'emote': emote });
        return true;
    }

    broadcast(msg: GameSockMsg): void;
    broadcast(msg: GameSockMsg, recipients: GamePlayer[]): void;
    broadcast(msg: GameSockMsg, recipients?: GamePlayer[]): void
    {
        const targets = recipients ?? this.everyone;
        for(const target of targets)
        {
            // console.log("Sending ", msg, " to ", target);
            (target.sockets ?? []).forEach(sock => sock.send(JSON.stringify(msg)));
        }
    }

    toJSON(): SharedGameValues
    {  // TODO : Filter out quizz answers and player sockets + player sessions
        return {
            id: this._id,
            owner: this._owner,
            quizz: this._quizz,
            players: this._players
        };
    }
}