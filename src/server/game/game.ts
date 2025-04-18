import { QuestionComponent, SimpleQuizzComponent } from "@common/quizz_components/components";
import GameState from "./game_state";
import { clearTimeout } from "node:timers";

export default class Game
{
    private _id: GameIdentifier;
    private _owner: GamePlayer;
    private _quizz: SimpleQuizzComponent;
    private _settings: GameSettings;
    private _players: GamePlayer[];
    private _state: GameState;
    private _currentQuestion: number;

    private _currentQuestionHaltTask: NodeJS.Timeout | undefined;
    private _questionStart: number | undefined;
    private _questionDuration: number | undefined;

    constructor(id: GameIdentifier, owner: GamePlayer, quizz: SimpleQuizzComponent, settings: GameSettings)
    {
        owner.currentGame = id;

        this._id = id;
        this._owner = owner;
        this._quizz = quizz;
        this._settings = settings;

        this._players = [];
        this._state = GameState.LOBBY;
        this._currentQuestion = 0;
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
        this.sendStateUpdate(user);

        return true;
    }

    addSockets(user: GamePlayer): boolean
    {
        var prevUser = this.get(user);
        if(!prevUser) return false;
        prevUser.sockets = (prevUser.sockets ?? []).concat(user.sockets ?? []).filter((value, index, array) => array.indexOf(value) === index);
        this.sendStateUpdate(prevUser);
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

    answer(user: GamePlayer, answer: number): boolean
    {
        const gamePlayer = this.get(user);

        if(!gamePlayer) return false;
        if(this.isOwner(user)) return false; // Owner can't answer
        if(this._state !== GameState.QUESTION) return false;

        // Add one answer on the owner's view
        this.broadcast({ 'type': 'add_one_answer' }, [this.owner]);
        // Register the answer and add the points
        if(this.currentQuestion?.checkAnswer(answer))
            gamePlayer.points = (gamePlayer.points ?? 0) + this.computePoints();

        return true;
    }

    getTimeLeft(): number {
        if (this._currentQuestionHaltTask === undefined || this._questionStart === undefined || this._questionDuration === undefined) return 0;

        const now = Date.now();
        const elapsed = now - this._questionStart;
        const remainingTime = this._questionDuration - elapsed;

        return remainingTime > 0 ? remainingTime : 0;
    }

    computePoints(): number
    {
        console.log(this.getTimeLeft());
        return 100;
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

    get currentQuestion(): QuestionComponent<BaseQuestionProps> | undefined
    {
        if(this._currentQuestion >= this._quizz.children.length) return undefined;
        return this._quizz.children[this._currentQuestion] as QuestionComponent<any>;
    }
    /**
     * Build the packet to display the current question
     */
    get currentQuestionPacket(): QuestionChangeSockMsg | undefined
    {
        const question = this.currentQuestion;
        if(!question) return undefined;
        return { 'type': 'new_question', 'question': question.toJSON() };
    }
    /**
     * Build the packet to display the leaderboard
     */
    get currentLeaderboardPacket(): ShowLeaderboardSockMsg
    {
        return { 'type': 'leaderboard', 'players': this.players, 'ended': this._currentQuestion === this._quizz.children.length - 1 };
    }
    /**
     * Owner wants to start the game
     */
    start(user: GamePlayer): boolean
    {
        if(!this.isOwner(user)) return false;
        if(this._state !== GameState.LOBBY) return false;

        console.log("Game started.");
        this._state = GameState.QUESTION_RESULTS;
        this._currentQuestion = -1;

        return this.nextQuestion(user);
    }
    /**
     * Owner wants to go to the next question (from results)
     */
    nextQuestion(user: GamePlayer): boolean
    {
        if(!this.isOwner(user)) return false;
        if(this._state !== GameState.QUESTION_RESULTS) return false;

        console.log("Next question asked.");
        ++this._currentQuestion;
        const packet = this.currentQuestionPacket;
        console.log(packet);
        if(!packet) { return false; }  // Should never happen

        this._state = GameState.QUESTION;
        
        const delay = (this.currentQuestion?.get('time_limit') ?? 15) * 1000;
        this._currentQuestionHaltTask = setTimeout(this.haltCurrentQuestion.bind(this), delay);
        this._questionStart = Date.now();
        this._questionDuration = delay;

        this.broadcast(packet);
        return true;
    }
    /**
     * Owner wants to show results for the current question
     */
    stopEarly(user: GamePlayer): boolean
    {
        if(!this.isOwner(user)) return false;
        if(this._state !== GameState.QUESTION) return false;

        console.log("Results asked early.");
        return this.haltCurrentQuestion();
    }
    haltCurrentQuestion(): boolean
    {
        if(this._state !== GameState.QUESTION) return false;
        clearTimeout(this._currentQuestionHaltTask);

        const packet = this.currentLeaderboardPacket;
        this._state = packet.ended ? GameState.ENDED : GameState.QUESTION_RESULTS;

        if(this._state === GameState.ENDED) console.log("Game ended.");
        else console.log("Showing results.");

        this.broadcast(packet);
        return true;
    }
    /**
     * Called when a player joins mid-game
     */
    sendStateUpdate(...to: GamePlayer[])
    {
        let packets = [];
        switch(this._state)
        {
            case GameState.LOBBY:  // Nothing more to do
                break;
            case GameState.ENDED:  // TODO : Send leaderboard
                break;
            case GameState.QUESTION_RESULTS:
                packets.push(this.currentLeaderboardPacket);
                break;
            case GameState.QUESTION:  // Send question data
                packets.push(this.currentQuestionPacket);  // TODO : Fix timing
                break;
        }
        packets.forEach(p => { if(p) this.broadcast(p, to) });
    }

    // TODO : Destroy game once ended
    // TODO : Setup a session that joins after the game has already started

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