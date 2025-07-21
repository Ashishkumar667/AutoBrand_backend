import express from 'express';
import { buyPlan } from '../../../provider/stripe/payment.js';
import authMiddleware from '../../../middleware/auth.js';
const router = express.Router();

router.post('/buy-plan',authMiddleware, buyPlan);

export default router;