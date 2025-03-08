import express from 'express';
import { getEndpoints } from '../../database/database_controller.js';
import { emptyQuizz } from '../../../../src/server/quizz_components/components.jsx';

export const router = express.Router();

// --- URL : /api/debug/

/**
 * List all accounts registered in the database
 */
router.get('/accounts', (req, res) => getEndpoints().allAccounts().then(data => res.status(200).json(data)));
/**
 * List all currently active session tokens
 */
router.get('/sessions', (req, res) => getEndpoints().allSessions().then(data => res.status(200).json(data)));
/**
 * List all currently active session tokens linked to a user
 */
router.get('/userSessions', (req, res) => getEndpoints().allUserSessions().then(data => res.status(200).json(data)));
/**
 * Create a quizz from parameters passed in the URL ()
 */
router.get('/addQuizz', (req, res) => {
    if(!req.user) return res.status(401).json({ 'error': 'Not logged in.' });
    if(!req.query.title) return res.status(400).json({ 'error': 'Missing field \"title\"' });
    if(!req.query.desc) return res.status(400).json({ 'error': 'Missing field \"desc\"' });

    const quizz = emptyQuizz();
    quizz.set('label', req.query.title as string);
    quizz.set('description', req.query.desc as string);
    getEndpoints().createQuizz(req.user, JSON.stringify(quizz)).then(data => res.status(200).json(data));
});
/**
 * List all quizzes registered in the database
 */
router.get('/quizzes', (req, res) => getEndpoints().allQuizzes().then(data => res.status(200).json(data)));
