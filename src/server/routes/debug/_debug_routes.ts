import express from 'express';
import { getEndpoints } from '../../database/database_controller.js';

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


router.get('/addQuizz', (req, res) => {
    getEndpoints().addQuizz(req.query.name as string, req.query.desc as string, req.query.param as string).then(data => res.status(200).json(data));    
});

router.get('/getQuizz', (req, res) => {
    getEndpoints().getQuizz().then(data => res.status(200).json(data));    
});

