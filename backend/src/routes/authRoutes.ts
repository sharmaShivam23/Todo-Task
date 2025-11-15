import express from 'express';
import { signup, signin, forgotPassword, resetPassword } from '../controllers/authController';
import { authLimiter } from '../middleware/security';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', authLimiter, signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
