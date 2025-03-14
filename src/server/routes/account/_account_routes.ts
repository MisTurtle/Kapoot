import express from 'express';
import { usernameChecker, emailChecker, FormInputChecker, passwordChecker } from '@common/sanitizers.js';
import { getEndpoints } from '@server/database/database_controller.js';
import { hash } from '@server/utils/security.js';
import { error, success } from '@common/responses';

export const router = express.Router();

// --- URL : /api/account/

/**
 * Check if a session is connected to a user account, and return information about that user if it's the case
 */
router.get('/', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    getEndpoints().accountDetails(req.user!).then(details => success(res, details));
});

/**
 * Attempt to create an account
 */
router.post('/', (req, res) => {
    const fields = [ 'username', 'mail', 'password' ];
    if(req.user) return error(res, 'Already logged in');  // User already logged in
    if(fields.some((field) => req.body[field] === undefined)) return error(res, 'Incomplete post body for account creation request');  // Bad request (TODO : Error page)
    
    // Check formats
    const checkers: FormInputChecker[] = [ usernameChecker, emailChecker, passwordChecker ];
    for(const [i, checker ] of checkers.entries()) {
        const field = fields[i];
        const result = checker(req.body[field]);
        
        if(!result.valid) return error(res, result.message ?? "");
    }

    // Check if account already exists, and if not, create an account
    getEndpoints().accountExists({ username: req.body.username, mail: req.body.mail }).then((accountInfo) => {
        if(accountInfo) return error(res, 'Account already exists');
        // Finally, create the account
        hash(req.body.password)
        .then(pwd_hash => getEndpoints().createAccount(req.body.username, req.body.mail, pwd_hash))
        .then(user_identifier => getEndpoints().linkAccountToSession(user_identifier, req.sessionID))
        .then((user) => success(res, 'Account created'))
        .catch((reason) => error(res, 'Unknown account creation error: ' + reason));
    });
});

// --- URL: /api/account/logout

/**
 * Logs the user out
 */
router.post('/logout', (req, res) => {
    if(!req.user) return error(res, 'Not logged in.');
    getEndpoints().closeSessions(req.user)
    .then(() => success(res, 'Logged out'))
    .catch((reason) => error(res, 'Unknown account logout error occurred: ' + reason));
});

// --- URL: /api/account/login

/**
 * Logs the user in
 */
router.post('/login', (req, res) => {
    if(req.user) return error(res, 'Already logged in');  // User already logged in
    if(!req.body.login || !req.body.password) return error(res, 'Incomplete post body for login request');
    
    // Login can either be the username or email address
    getEndpoints().verifyLogin({ username: req.body.login, mail: req.body.login }, req.body.password)
    .then(async user_value => {
        if(!user_value) return error(res, 'Incorrect identifier or password');
        await getEndpoints().linkAccountToSession(user_value, req.sessionID);
        return success(res, 'Logged in');
    })
    .catch((reason) => error(res, 'Unknown account login error occurred: ' + reason));
});
