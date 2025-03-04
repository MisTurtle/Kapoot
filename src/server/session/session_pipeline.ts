import express from 'express';
import session from 'express-session';
import CustomSessionStore from './session_store';
import { allValidSecrets, sessionCookieLifetime } from './session_secret.js';
import { getEndpoints } from '../database/database_controller.js';

/** Setup session cookie generation routes */
export const router = express.Router();

// Add a session cookie to requests that don't already have one
const store = new CustomSessionStore();
router.use(session({
    store: store,
    name: 'sessId',  // Cookie name
    cookie: { httpOnly: true, maxAge: sessionCookieLifetime },  // One day, and do not show in document.cookie
    secret: allValidSecrets,  // Secrets to consider for checking a cookie's authenticity
    
    resave: false,
    saveUninitialized: true
}));

// Add a user context to the session if the account can be retrieved from the database
router.use((req, res, next) => {
    if(!req.sessionID) next();
    getEndpoints().getAccountFromSession(req.sessionID).then((user) => {
        console.log(req.sessionID)
        console.log(user);
        req.user = user;
        console.log("Set user: " + req.user);
        next();
    });
});
