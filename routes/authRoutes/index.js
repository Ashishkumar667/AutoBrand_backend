import express from 'express';
import{ registerUser }from '../../controllers/auth/auth.js';
import{ LoginUser }from '../../controllers/auth/auth.js';
import{ UserProfile }from '../../controllers/auth/auth.js';
import authMiddleware from '../../middleware/auth.js';
import{ verifyOtp }from '../../controllers/auth/auth.js';
import{ sendOtp, setNewPassword }from '../../controllers/auth/auth.js'
const router = express.Router();


router.post('/signup', registerUser);
router.post('/login', LoginUser);
router.get('/profile', authMiddleware, UserProfile);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', sendOtp);
router.post('/set-new-password', setNewPassword);

export default router;