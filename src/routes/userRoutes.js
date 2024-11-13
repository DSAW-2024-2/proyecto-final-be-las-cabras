import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

router.put('/profile', authMiddleware, updateUserProfile);

export default router;