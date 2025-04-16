import express from 'express';
import { getEndpoints } from '@server/database/database_controller.js';
import { emptyQuizz, SimpleQuizzComponent } from '@common/quizz_components/components.jsx';
import { error, success } from '@common/responses';
import KapootGameManager from '@server/game/game_manager';

export const router = express.Router();

// --- URL : /api/game/

/**
 * Action: Get the current user's game
 */
router.get('/', (req, res) => {
    if(!req.gamePlayer) return error(res, 'No game found');  // Shouldn't happen as req.gamePlayer is already filled in no matter what at this point 
    const game = KapootGameManager.getPlayerGame(req.gamePlayer);
    if(!game) return error(res, 'No game found');
    return success(res, game.toJSON());
});

/**
 * Action: Create a game
 */
router.post('/', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    const quizz_id = req.body.quizz_id;
    
    if(KapootGameManager.isPlaying(req.gamePlayer!)) return error(res, 'You are already assigned to a game');
    if(!quizz_id) return error(res, 'Missing quizz id');

    // TODO : Check this user is the actual owner of the quizz
    const serializedQuizz = getEndpoints().getSerializedQuizz(quizz_id);
    if(!serializedQuizz) return error(res, 'Quizz does not exist');

    const deserializedQuizz = SimpleQuizzComponent.deserialize(serializedQuizz);
    const game_id = KapootGameManager.createGame(req.gamePlayer!, deserializedQuizz, {});
    return success(res, { 'game_id': game_id });
});

/**
 * Action: Join a game
 */
router.put('/:game_id', (req, res) => {
    if(!req.gamePlayer) return error(res, 'A server-side error occurred.');
    if(req.gamePlayer?.currentGame !== undefined) return error(res, 'You are already assigned to a game');

    let reqGame = KapootGameManager.getGameById(parseInt(req.params.game_id));
    if(!reqGame) return error(res, "Room doesn't exist");

    if(!reqGame.add(req.gamePlayer)) return error(res, "You are already in this game");
    return success(res, reqGame.toJSON());
});
