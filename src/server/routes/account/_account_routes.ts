import express from 'express';
import { usernameChecker, emailChecker, FormInputChecker, passwordChecker } from '../../utils/sanitizers.js';
import { getEndpoints } from '../../database/database_controller.js';
import { hash } from '../../../../src/server/utils/security.js';

export const router = express.Router();

// --- URL : /api/account/

/**
 * Check if a session is connected to a user account, and return information about that user if it's the case
 */
router.get('/', (req, res) => {
    console.log(req.sessionID);
    if(!req.user) return res.status(404).json({ 'error': 'Not logged in' });
    getEndpoints().accountDetails(req.user!).then((details) => res.status(200).json({ 'data': details }));
});

/**
 * Attempt to create an account
 */
router.post('/', (req, res) => {
    const fields = [ 'username', 'mail', 'password' ];
    if(req.user) return res.status(403).json({ 'error': 'Already logged in' });  // User already logged in
    if(fields.some((field) => req.body[field] === undefined)) return res.status(400).json({ 'error': 'Incomplete post body for account creation request' });  // Bad request (TODO : Error page)
    
    // Check formats
    const checkers: FormInputChecker[] = [ usernameChecker, emailChecker, passwordChecker ];
    for(const [i, checker ] of checkers.entries()) {
        const field = fields[i];
        const result = checker(req.body[field]);
        
        if(!result.valid) return res.status(400).json({ 'error': result.error });
    }

    // Check if account already exists, and if not, create an account
    getEndpoints().accountExists({ username: req.body.username, mail: req.body.mail }).then((accountInfo) => {
        if(accountInfo) return res.status(401).json({ 'error': 'Account already exists' });
        // Finally, create the account
        hash(req.body.password)
        .then(pwd_hash => getEndpoints().createAccount(req.body.username, req.body.mail, pwd_hash))
        .then(user_identifier => getEndpoints().linkAccountToSession(user_identifier, req.sessionID))
        .then((user) => res.status(200).json({ 'result': 'Account created' }))
        .catch((reason) => res.status(401).json({ 'error': 'Unknown account creation error: ' + reason }));
    });
});

// --- URL: /api/account/logout

/**
 * Logs the user out
 */
router.post('/logout', (req, res) => {
    if(!req.user) return res.status(404).json({ 'error': 'Not logged in' });
    getEndpoints().closeSessions(req.user)
    .then(() => res.status(200).json({ 'result': 'Logged out'}))
    .catch((reason) => res.status(401).json({ 'error': 'Unknown account logout error occurred: ' + reason }));
});

// --- URL: /api/account/login

/**
 * Logs the user in
 */
router.post('/login', (req, res) => {
    if(req.user) return res.status(403).json({ 'error': 'Already logged in' });  // User already logged in
    if(!req.body.login || !req.body.password) return res.status(400).json({ 'error': 'Incomplete post body for login request' });
    
    // Login can either be the username or email address
    getEndpoints().verifyLogin({ username: req.body.login, mail: req.body.login }, req.body.password)
    .then(async user_value => {
        if(!user_value) return res.status(401).json({ 'error': 'Incorrect identifier or password' });
        console.log(user_value);
        await getEndpoints().linkAccountToSession(user_value, req.sessionID);
        res.status(200).json({ 'result': 'Logged in' });
    })
    .catch((reason) => res.status(401).json({ 'error': 'Unknown account login error occurred: ' + reason }));
});
