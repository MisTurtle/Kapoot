import express from 'express';
import { getEndpoints } from '@server/database/database_controller';
import { uuidChecker } from '@common/sanitizers';
import { error, success } from '@common/responses';

export const router = express.Router();

// --- URL : /api/user/

/**
 * Get information about a user
 */
router.get('/:userId', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
        
        const userId: string = req.params.userId;
        if(!userId) return error(res, 'Incomplete request data (Missing user id).');
        if(!uuidChecker(userId).valid) return error(res, 'Invalid quizz ID.');
    
        getEndpoints().getUserAccountData(userId)
        .then((result) => {success(res, result)})
        .catch((err) => {
            console.error(err);
            error(res, 'Failed to get user data');
        });
});
// router.get('/:userId', (req, res) => {
//     if(!req.user) return error(res, 'Not logged in.');
        
//         const userId: string = req.params.userId;
//         if(!userId) return error(res, 'Incomplete request data (Missing user id).');
//         if(!uuidChecker(userId).valid) return error(res, 'Invalid quizz ID.');
    
//         getEndpoints().getUserAccountData(userId)
//         .then((result) => {success(res, result)})
//         .catch((err) => {
//             console.error(err);
//             error(res, 'Failed to get user data');
//         });
// });
