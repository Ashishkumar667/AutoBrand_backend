import express from 'express';
import registerUser from '../../controllers/auth/auth.js';
import LoginUser from '../../controllers/auth/auth.js';
import profileUser from '../../controllers/auth/auth.js';
import authMiddleware from '../../middleware/auth.js';
import verifyOtp from '../../controllers/auth/auth.js';
import sendOtp from '../../controllers/auth/auth.js'
const router = express.Router();


router.post('/signup', registerUser);
router.post('/login', LoginUser);
router.get('/profile', authMiddleware, profileUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', sendOtp);

export default router;