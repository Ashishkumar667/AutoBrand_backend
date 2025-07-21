import express from 'express';
import { generateInsight } from '../../controllers/aicontroller/aicontroller.js';
import authMiddleware from '../../middleware/auth.js';
const router = express.Router();

router.post("/insight",authMiddleware, generateInsight);

export default router;