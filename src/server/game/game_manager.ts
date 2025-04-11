import { SimpleQuizzComponent } from "@common/quizz_components/components";
import Game from "./game";


export const MIN_GAME_ID = 100000;
export const MAX_GAME_ID = 999999;

class GameManager {

    private _games: { [key: GameIdentifier]: Game } = {};
    
    // TODO : Add and remove games
    // TODO : Add and remove players
    createGame(owner: UserIdentifier, quizz: SimpleQuizzComponent, settings: GameSettings): GameIdentifier
    {
        let gameId;
        do{
            gameId = Math.floor(MIN_GAME_ID + Math.random() * (MAX_GAME_ID - MIN_GAME_ID));
        }while(this.getGame(gameId) !== undefined);

        let game = new Game(gameId, owner, quizz, settings);
        this._games[gameId] = game;
        return gameId;
    }

    getGame(id: GameIdentifier): Game | undefined { return this._games[id]; }
    getAllGames(): Game[] { return Object.values(this._games); }

    removeGame(id: GameIdentifier): boolean
    {
        if(this.getGame(id) === undefined) return false;
        delete this._games[id];
        return true;
    }

    isPlaying(user: UserIdentifier): boolean
    {
        return Object.values(this._games).some(game => game.contains(user));
    }
}

const KapootGameManager = new GameManager();
export default KapootGameManager;
