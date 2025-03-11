import express from 'express';
import { getEndpoints } from '@server/database/database_controller';
import { QuizzComponent, emptyQuizz } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';

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
    if(!req.user) return res.status(404).json({ 'error': 'Not logged in' });
    
    const quizz_id: string = req.params.id;
    if(!quizz_id) return res.status(400).json({ 'error': 'Incomplete request data (Missing quizz id)' });
    if(!uuidChecker(quizz_id).valid) return res.status(400).json({ 'error': 'Invalid quizz ID' });

    getEndpoints().getSerializedQuizz(quizz_id)
    .then((params) => {
        if(!params) return res.status(404).json({ 'error': 'Quizz does not exist' });
        return res.status(200).send(params);
    });
});

/**
 * Action: Update an existing quizz's details
 */
router.patch('/quizz/:id', (req, res) => {

});

/**
 * Action: Delete a quizz
 */
// TODO : Try ths function, didn't do since there is no quizz in database
router.delete('/quizz/:id', (req, res) => {
    if(!req.user) return res.status(404).json({ 'error': 'Not logged in' });
    
    const quizz_id: string = req.params.id;
    if(!quizz_id) return res.status(400).json({ 'error': 'Incomplete request data (Missing quizz id)' });
    if(!uuidChecker(quizz_id).valid) return res.status(400).json({ 'error': 'Invalid quizz ID' });

    getEndpoints().deleteQuizz(quizz_id);
    
});

/**
 * Action: Get all quizzes
 */
router.get('/quizz', (req, res) => {
    
});
