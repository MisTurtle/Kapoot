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
        this._owner = owner;
        this._quizz = quizz;
        this._settings = settings;
        this._players = [];
    }

    getId() { return this._id; }

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

        return true;
    }

    remove(user: GamePlayer): boolean
    {
        if(!this.get(user)) return false;
        this._players = this._players.filter(p => !this.equals(p, user));
        return true;
    }

    toJSON(): SharedGameValues
    {
        return {
            id: this._id,
            owner: this._owner,
            quizz: this._quizz,
            players: this._players
        };
    }
}