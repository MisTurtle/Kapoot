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
    private _answeredPlayers: GamePlayer[];

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
        this._answeredPlayers = [];
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

    get ended(): boolean
    {
        return this._state === GameState.ENDED;
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

    get(user: GamePlayerIdentifier): GamePlayer | undefined;
    get(user: GamePlayerIdentifier, among: GamePlayer[]): GamePlayer | undefined;
    get(user: GamePlayerIdentifier, among?: GamePlayer[]): GamePlayer | undefined
    {
        if(this.isOwner(user)) return this._owner;
        return (among ?? this._players).find(p => this.equals(user, p));
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
        if(this.isOwner(user)) return false;  // Owner can't answer
        if(this._state !== GameState.QUESTION) return false;
        if(this.get(gamePlayer, this._answeredPlayers)) return false;  // Already answered

        // Register the user's answer
        gamePlayer.lastAnswer = answer;
        this._answeredPlayers.push(gamePlayer);

        // Add one answer on the owner's view
        if(this.currentQuestion?.checkAnswer(answer))
            gamePlayer.points = (gamePlayer.points ?? 0) + this.computePoints();
        
        this.broadcast({ 'type': 'update_answer_count', answers: this._answeredPlayers.map(p => p.lastAnswer!) }, [this.owner]);
        if(this._answeredPlayers.length === this.players.length) this.haltCurrentQuestion();
        
        return true;
    }

    getTimeLeft(): number | undefined {
        if (this._currentQuestionHaltTask === undefined || this._questionStart === undefined || this._questionDuration === undefined) return undefined;

        const now = Date.now();
        const elapsed = now - this._questionStart;
        const remainingTime = this._questionDuration - elapsed;

        return remainingTime > 0 ? remainingTime : 0;
    }

    computePoints(): number
    {
        let timeLeft = this.getTimeLeft();
        const duration = this._questionDuration;
        if(timeLeft === undefined || duration === undefined || duration === 0) return 0;
        
        timeLeft /= 1000;
        const elapsed = duration - timeLeft;
        const maxPoints = 1000;
        const minPoints = 250;

        if(elapsed < 0.75) return maxPoints;
        const x = 1 - (elapsed - 0.75) / duration;
        const points = minPoints - (maxPoints - minPoints) * Math.tanh((x - 1) * 2.5);
        
        return Math.floor(Math.min(maxPoints, Math.max(minPoints, points)));
    }

    broadcast(msg: GameSockMsg): void;
    broadcast(msg: GameSockMsg, recipients: GamePlayer[]): void;
    broadcast(msg: GameSockMsg, recipients?: GamePlayer[]): void
    {
        const targets = recipients ?? this.everyone;
        for(const target of targets)
            (target.sockets ?? []).forEach(sock => sock.send(JSON.stringify(msg)));
    }

    // TODO : Change that with new question types
    get currentQuestion(): QuestionComponent<SimpleQuestionProps> | undefined
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
        return { 'type': 'new_question', 'question': question.toJSON(), 'time_override': this.getTimeLeft() ? Math.floor(this.getTimeLeft()! / 1000) : undefined };
    }
    /**
     * Build the packet to display the leaderboard
     */
    get currentLeaderboardPacket(): ShowLeaderboardSockMsg
    {
        return { 
            'type': 'leaderboard',
            'players': this.players.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)),
            'prev_answer': (this.currentQuestion?.get('answer') ?? 0) as number,
            'ended': this._currentQuestion === this._quizz.children.length - 1
        };
    }
    getCurrentLeaderboardFor(user: GamePlayer): ShowLeaderboardSockMsg
    {
        const pk = this.currentLeaderboardPacket;
        pk.rank = pk.players.findIndex(u => u === user);
        return pk;
    }
    /**
     * Owner wants to start the game
     */
    start(user: GamePlayer): boolean
    {
        if(!this.isOwner(user)) return false;
        if(this._state !== GameState.LOBBY) return false;

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

        ++this._currentQuestion;
        const packet = this.currentQuestionPacket;
        if(!packet) { return false; }  // Should never happen

        this._state = GameState.QUESTION;
        
        const delay = (this.currentQuestion?.get('time_limit') ?? 15) * 1000;
        this._currentQuestionHaltTask = setTimeout(this.haltCurrentQuestion.bind(this), delay);
        this._questionStart = Date.now();
        this._questionDuration = delay;

        // Reset answers
        this._answeredPlayers = [];
        this.everyone.forEach(p => p.lastAnswer = undefined);

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

        return this.haltCurrentQuestion();
    }
    haltCurrentQuestion(): boolean
    {
        if(this._state !== GameState.QUESTION) return false;
        clearTimeout(this._currentQuestionHaltTask);
        this._currentQuestionHaltTask = undefined;

        const packet = this.currentLeaderboardPacket;
        this._state = packet.ended ? GameState.ENDED : GameState.QUESTION_RESULTS;

        this.players.forEach(player => this.broadcast(this.getCurrentLeaderboardFor(player), [player]));
        this.broadcast(packet, [this.owner]);
        // TODO : Delete game after some time
        return true;
    }
    /**
     * Called when a player joins mid-game
     */
    sendStateUpdate(...to: GamePlayer[])
    {
        to.forEach(player => {
            let packets = [];
            switch(this._state)
            {
                case GameState.LOBBY:  // Nothing more to do
                    break;
                case GameState.ENDED:  // TODO : Send leaderboard
                    break;
                case GameState.QUESTION_RESULTS:
                    packets.push(this.currentQuestionPacket);
                    packets.push(this.getCurrentLeaderboardFor(player));
                    break;
                case GameState.QUESTION:  // Send question data
                    packets.push(this.currentQuestionPacket);  // TODO : Fix timing
                    break;
            }

            packets.forEach(p => { if(p) this.broadcast(p, [player]) });
        });
    }

    // TODO : Add one answer on the owner's view
    // TODO : Change view when user answers
    // TODO : Destroy game once ended
    // TODO : Setup a session that joins after the game has already started

    initiateFor(user: GamePlayer): GamePageInitiatorValues
    {  // TODO : Filter out quizz answers and player sockets + player sessions
        return {
            id: this._id,
            owner: this._owner,
            self: user,
            players: this._players
        };
    }
}