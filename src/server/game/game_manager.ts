import { SimpleQuizzComponent } from "@common/quizz_components/components";
import Game from "./game";
import { Request } from "express";
import { randomIGN } from "@server/utils/ign";


export const MIN_GAME_ID = 100000;
export const MAX_GAME_ID = 999999;

class GameManager {

    private _games: { [key: GameIdentifier]: Game } = {};
    
    /**
     * Game Management
     */
    createGame(owner: GamePlayer, quizz: SimpleQuizzComponent, settings: GameSettings): GameIdentifier
    {
        let gameId, associatedGame;
        do{
            gameId = Math.floor(MIN_GAME_ID + Math.random() * (MAX_GAME_ID - MIN_GAME_ID));
            associatedGame = this.getGameById(gameId);
            if(associatedGame?.ended) this.removeGame(associatedGame.id);
        }while(associatedGame !== undefined && !associatedGame.ended);

        let game = new Game(gameId, owner, quizz, settings);
        this._games[gameId] = game;
        return gameId;
    }
    removeGame(id: GameIdentifier): boolean
    {
        if(this.getGameById(id) === undefined) return false;
        delete this._games[id];
        return true;
    }
    getGameById(id: GameIdentifier | undefined): Game | undefined 
    { 
        if(id === undefined) return undefined;
        return this._games[id]; 
    }
    getAllGames(): Game[] 
    {
        return Object.values(this._games);
    }

    /**
     * Player management
     */
    createPlayerObjectFromRequest(req: Request): GamePlayer
    {
        let player: GamePlayer = { 
            accountId: req.user?.identifier,
            sessionId: req.sessionID,
            username: req.user?.username ?? randomIGN()
        };
        let game = this.getPlayerGame(player);
        return game?.get(player) ?? player;
    }
    getPlayerGame(user: GamePlayerIdentifier): Game | undefined
    {
        return Object.values(this._games).find(game => !game.ended && game.contains(user));
    }
    isPlaying(user: GamePlayerIdentifier): boolean
    {
        return this.getPlayerGame(user) !== undefined;
    }
}

const KapootGameManager = new GameManager();
export default KapootGameManager;
