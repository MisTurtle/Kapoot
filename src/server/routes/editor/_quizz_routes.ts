import express from 'express';
import { getEndpoints } from '@server/database/database_controller';
import { QuizzComponent, emptyQuizz } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { error, success } from '@common/responses';

export const router = express.Router();

// --- URL : /api/editor/quizz

/**
 * Action: Create a new quizz
 */
router.post('/quizz', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    
    let quizz = emptyQuizz();

    const template: string | undefined = req.body.template;
    if(template) {
        /* TODO : Fetch a quizz template */
        quizz = emptyQuizz();
    }

    let stringified = JSON.stringify(quizz);
    getEndpoints().createQuizz(req.user, stringified).then((quizz_id) => success(res, { 'identifier': quizz_id, 'params': stringified }));
});

/**
 * Action: Get a quizz details
 */
router.get('/quizz/:id', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    
    const quizz_id: string = req.params.id;
    if(!quizz_id) return error(res, 'Incomplete request data (Missing quizz id).');
    if(!uuidChecker(quizz_id).valid) return error(res, 'Invalid quizz ID.');

    getEndpoints().getSerializedQuizz(quizz_id).then((params) => {
        if(!params) return error(res, 'Quizz does not exist.');
        return success(res, params);
    });
});

/**
 * Action: Update an existing quizz's details
 */
router.patch('/quizz/:id/:param', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');

    const quizz_id: string = req.params.id;
    if(!quizz_id) return error(res, 'Incomplete request data (Missing quizz id)');
    if(!uuidChecker(quizz_id).valid) return error(res, 'Invalid quizz ID');

    // TODO : Check the user actually owns the quizz ^^ (Pass the user id to deleteQuizz so it only removes it if a rows with user_id && quizz_id exists)
    const param: string = req.params.param;
    getEndpoints().updateQuizz(param, quizz_id).then(() => success(res));
});

/**
 * Action: Delete a quizz
 */
router.delete('/quizz/:id', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    
    const quizz_id: string = req.params.id;
    if(!quizz_id) return error(res, 'Incomplete request data (Missing quizz id)');
    if(!uuidChecker(quizz_id).valid) return error(res, 'Invalid quizz ID');

    // TODO : Check the user actually owns the quizz ^^ (Pass the user id to deleteQuizz so it only removes it if a rows with user_id && quizz_id exists)
    getEndpoints().deleteQuizz(quizz_id).then(() => success(res));
});

/**
 * Action: Get all quizzes
 */
router.get('/quizz', (req, res) => {
    
});
