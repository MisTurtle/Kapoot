import { SimpleQuizzComponent } from "@common/quizz_components/components";

export default class Game
{
    private _id: GameIdentifier;
    private _owner: UserIdentifier;
    private _quizz: SimpleQuizzComponent;
    private _settings: GameSettings;
    private _players: Player[];

    constructor(id: GameIdentifier, owner: UserIdentifier, quizz: SimpleQuizzComponent, settings: GameSettings)
    {
        this._id = id;
        this._owner = owner;
        this._quizz = quizz;
        this._settings = settings;
        this._players = [];
    }

    getId() { return this._id; }

    contains<T extends UserIdentifier>(user: T): boolean
    {
        return this._owner.identifier === user.identifier || this._players.some(p => p.account?.identifier === user.identifier);
    }
}