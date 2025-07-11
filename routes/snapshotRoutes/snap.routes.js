import express from 'express';
import { getSnapshotsByBrand } from '../controllers/snapshotController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.get('/:brandId', authMiddleware, getSnapshotsByBrand);

export default router;
