import express from 'express';
import { getEndpoints } from '../../../../src/server/database/database_controller';
import { QuizzComponent, emptyQuizz } from '../../../../src/server/quizz_components/components';

export const router = express.Router();

// --- URL : /api/editor/quizz

/**
 * Action: Create a new quizz
 */
router.post('/quizz', (req, res) => {
    if(!req.user) return res.status(404).json({ 'error': 'Not logged in' });
    
    let quizz = emptyQuizz();

    const template: string | undefined = req.body.template;
    if(template) {
        /* TODO : Fetch a quizz template */
        quizz = emptyQuizz();
    }

    let stringified = JSON.stringify(quizz);
    getEndpoints().createQuizz(req.user, stringified).then((quizz_id) => res.status(200).json({ 'identifier': quizz_id, 'params': stringified }));
});

/**
 * Action: Get a quizz details
 */
router.get('/quizz/:id', (req, res) => {

});

/**
 * Action: Update an existing quizz's details
 */
router.put('/quizz/:id', (req, res) => {

});

/**
 * Action: Delete a quizz
 */
router.delete('/quizz/:id', (req, res) => {

});

/**
 * Action: Get all quizzes
 */
router.get('/quizz', (req, res) => {
    
});
