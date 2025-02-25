import express from 'express';
import session from 'express-session';
import { allValidSecrets } from './session_secret.js';

/** Setup session cookie generation routes */
export const router = express.Router();
router.use(session({
    name: 'sessId',  // Cookie name
    cookie: { httpOnly: true, maxAge: 60 * 60 * 24 * 31 },  // One month, and do not show in document.cookie
    secret: allValidSecrets,  // Secrets to consider for checking a cookie's authenticity
    
    resave: false,
    saveUninitialized: false,
}));
