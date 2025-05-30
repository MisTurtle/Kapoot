import express from 'express';
import session from 'express-session';
import CustomSessionStore from './session_store';
import { allValidSecrets, sessionCookieLifetime } from './session_secret.js';
import { getEndpoints } from '@server/database/database_controller.js';
import KapootGameManager from '@server/game/game_manager';

/** Setup session cookie generation routes */
export const router = express.Router();

// Add a session cookie to requests that don't already have one
const store = new CustomSessionStore();
export const sessionParser = session({
    store: store,
    name: 'sessId',  // Cookie name
    cookie: { httpOnly: true, maxAge: sessionCookieLifetime },  // One day, and do not show in document.cookie
    secret: allValidSecrets,  // Secrets to consider for checking a cookie's authenticity
    
    resave: false,
    saveUninitialized: true
});
router.use(sessionParser);

// Add a user context to the session if the account can be retrieved from the database
router.use((req, res, next) => {
    if(!req.sessionID) next();
    getEndpoints().getAccountFromSession(req.sessionID, true)
    .then((user) => {
        req.user = user;
        req.gamePlayer = KapootGameManager.createPlayerObjectFromRequest(req);
        next();
    });
});
