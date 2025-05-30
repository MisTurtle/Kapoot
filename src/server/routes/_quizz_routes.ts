import express from 'express';
import { getEndpoints } from '@server/database/database_controller';
import { QuestionComponent, QuizzComponent, SimpleQuizzComponent, emptyQuizz } from '@common/quizz_components/components';
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
    quizz.addDefault();

    const template: string | undefined = req.body.template;
    if(template) {
        /* TODO : Here could be implemented quizz templates / forks of quizzes */
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

    getEndpoints().getSerializedQuizz(req.user, quizz_id).then((params) => {
        if(!params) return error(res, 'Quizz does not exist.');
        return success(res, params);
    });
});

/**
 * Action: Update an existing quizz's details
 */
router.patch('/quizz/:id', (req, res) => {
    if (!req.user) return error(res, 'Not logged in.');

    const quizz_id: string = req.params.id;
    if (!quizz_id) return error(res, 'Incomplete request data (Missing quizz id)');
    if (!uuidChecker(quizz_id).valid) return error(res, 'Invalid quizz ID');

    try{
        const quizz = SimpleQuizzComponent.deserialize_component(req.body);
        
        getEndpoints().updateQuizz(req.user, JSON.stringify(quizz), quizz_id)
        .then(() => success(res))
        .catch(() => error(res, 'Failed to update quizz'));
    }catch(err) {
        return error(res, 'Invalid quizz data: ' + err);
    }
});


/**
 * Action: Delete a quizz
 */
router.delete('/quizz/:id', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    
    const quizz_id: string = req.params.id;
    if(!quizz_id) return error(res, 'Incomplete request data (Missing quizz id)');
    if(!uuidChecker(quizz_id).valid) return error(res, 'Invalid quizz ID');

    try {
        getEndpoints().deleteQuizz(req.user, quizz_id)
        .then(result => success(res, result))
        .catch(() => error(res, 'Failed to delete quizz'));
    } catch (err) {
        error(res, 'Invalid quizz data: ' + err);
    }
    
});

/**
 * Action: Get all quizzes from a user account
 */
router.get('/quizz', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');

    getEndpoints().getUserSerializedQuizzes(req.user).then(result => success(res, result));
});
