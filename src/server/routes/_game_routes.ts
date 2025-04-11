import express from 'express';
import { getEndpoints } from '@server/database/database_controller.js';
import { emptyQuizz, SimpleQuizzComponent } from '@common/quizz_components/components.jsx';
import { error, success } from '@common/responses';
import KapootGameManager from '@server/game/game_manager';

export const router = express.Router();

// --- URL : /api/game/

router.post('/', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');

    const quizz_id = req.body.quizz_id;
    
    if(KapootGameManager.isPlaying(req.user)) return error(res, 'You are already playing inside a game');
    if(!quizz_id) return error(res, 'Missing quizz id');

    // TODO : Check this user is the actual owner of the quizz
    const serializedQuizz = getEndpoints().getSerializedQuizz(quizz_id);
    if(!serializedQuizz) return error(res, 'Quizz does not exist');

    const deserializedQuizz = SimpleQuizzComponent.deserialize(serializedQuizz);
    const game_id = KapootGameManager.createGame(req.user, deserializedQuizz, {});
    return success(res, { 'game_id': game_id });
});
