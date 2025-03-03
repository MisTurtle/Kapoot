import express from 'express';
import { usernameChecker, emailChecker, pwdHashChecker, saltChecker, FormInputChecker } from '../../utils/sanitizers.js';
import { getEndpoints } from '../../database/database_controller.js';

export const router = express.Router();

// --- URL : /api/account/

/**
 * Check if a session is connected to a user account, and return information about that user if it's the case
 */
router.get('', (req, res) => {

});

/**
 * Attempt to create an account
 */
router.post('/', (req, res) => {
    const fields = [ 'username', 'mail', 'pwd_hash', 'salt' ];
    if(req.user !== undefined) return res.status(403).json({ 'error': 'Already logged in' });  // User already logged in
    if(fields.some((field) => req.body[field] === undefined)) return res.status(400).json({ 'error': 'Missing mandatory information' });  // Bad request (TODO : Error page)
    
    // Check formats
    const checkers: FormInputChecker[] = [ usernameChecker, emailChecker, pwdHashChecker, saltChecker ];
    for(const [i, checker ] of checkers.entries()) {
        const field = fields[i];
        const result = checker(req.body[field]);
        
        if(!result.valid) return res.status(400).json({ 'error': result.error });
    }

    getEndpoints().accountExists({ username: req.body.username, mail: req.body.mail }).then((accountInfo) => {
        if(accountInfo !== undefined) return res.status(403).json({ 'error': 'Account already exists' });
        // Finally, create the account
        getEndpoints().createAccount(req.body.username, req.body.mail, req.body.pwd_hash, req.body.salt)
        .then((user) => res.status(200).json({ 'result': 'Account created' }));
    });
});
