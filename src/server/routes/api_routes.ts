import express from 'express';
import { router as quizzRoutes } from './editor/_quizz_routes.js';
import { router as userRoutes } from './stats/_user_routes.js';

export const router = express.Router();

// URL: /api/user
router.use('/', userRoutes);
// URL: /api/editor/*
router.use('/editor', quizzRoutes);

