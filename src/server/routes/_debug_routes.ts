import express from 'express';
import { getEndpoints } from '@server/database/database_controller.js';
import { emptyQuizz } from '@common/quizz_components/components.jsx';
import { error, success } from '@common/responses';
import KapootGameManager from '@server/game/game_manager';

export const router = express.Router();

// --- URL : /api/debug/

/**
 * List all accounts registered in the database
 */
router.get('/accounts', (req, res) => getEndpoints().allAccounts().then(data => success(res, data)));
/**
 * List all currently active session tokens
 */
router.get('/sessions', (req, res) => getEndpoints().allSessions().then(data => success(res, data)));
/**
 * List all currently active session tokens linked to a user
 */
router.get('/userSessions', (req, res) => getEndpoints().allUserSessions().then(data => success(res, data)));
router.get('/games', (req, res) => res.json(KapootGameManager.getAllGames()));
/**
 * Create a quizz from parameters passed in the URL ()
 */
router.get('/addQuizz', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    if(!req.query.title) return error(res, 'Missing field \"title\"');
    if(!req.query.desc) return error(res, 'Missing field \"desc\"');

    const quizz = emptyQuizz();
    quizz.set('label', req.query.title as string);
    quizz.set('description', req.query.desc as string);
    getEndpoints().createQuizz(req.user, JSON.stringify(quizz)).then(data => success(res, data));
});
/**
 * List all quizzes registered in the database
 */
router.get('/quizzes', (req, res) => getEndpoints().allQuizzes().then(data => success(res, data)));
/**
 * Delete a quizz from parameters passed in the URL ()
 */
router.get('/deleteQuizz', (req, res) => {
    if(!req.query.quizzId) return error(res, 'Missing field \"quizzId\"');
    getEndpoints().deleteQuizz(req.query.quizzId as string).then(data => success(res, data));
});
/**
 * Update a quizz from parameters passed in the URL ()
 */
router.get('/updateQuizz', (req, res) => {
    if(!req.query.quizzId) return error(res, 'Missing field \"quizzId\"');
    if(!req.query.param) return error(res, 'Missing field \"param\"');

    getEndpoints().updateQuizz(JSON.stringify(req.query.param), req.query.quizzId as string).then(data => success(res, data));
});
/**
 * Get all user data 
 */
router.get('/allUserData', (req, res) => getEndpoints().allUserData().then(data => success(res, data)));
/**
 * Get user data from user_if passed in the URL ()
 */
router.get('/userData', (req, res) => {
    if(!req.query.userId) return error(res, 'Missing field \"userId\"');

    getEndpoints().getUserAccountData(req.query.userId as string).then(data => success(res, data));
});
