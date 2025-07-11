import express from 'express';
import generateInsight from '../../controllers/aicontroller/aicontroller.js';
const router = express.Router();

router.post("/insight", generateInsight);

export default router;