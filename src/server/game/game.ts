import { SimpleQuizzComponent } from "@common/quizz_components/components";

export default class Game
{
    private _owner: UserIdentifier;
    private _quizz: SimpleQuizzComponent;
    private _settings: GameSettings;
    private _players: Player[];

    constructor(owner: UserIdentifier, quizz: SimpleQuizzComponent, settings: GameSettings)
    {
        this._owner = owner;
        this._quizz = quizz;
        this._settings = settings;
        this._players = [];
    }
}