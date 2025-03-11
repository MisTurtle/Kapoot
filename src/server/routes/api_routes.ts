import express from 'express';
import { router as accountRoutes } from './account/_account_routes.js';
import { router as quizzRoutes } from './editor/_quizz_routes.js';
import { router as userRoutes } from './stats/_user_routes.js';
import { router as debugRoutes } from './debug/_debug_routes.js';
import { production } from '@common/utils.js';

export const router = express.Router();


// URL: /api/account
router.use('/account', accountRoutes);
// URL: /api/user
router.use('/user', userRoutes);
// URL: /api/editor
router.use('/editor', quizzRoutes);

// URL: /api/debug
if(!production) router.use('/debug', debugRoutes);

