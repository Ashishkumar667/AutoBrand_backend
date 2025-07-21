import express from 'express';
import {
  getUserBrands,
  getBrandById,
  addBrand,
  updateBrand,
  deleteBrand
} from '../../controllers/brandController/brandController.js';

import authMiddleware from '../../middleware/auth.js';

const router = express.Router();


router.post('/add/brand', authMiddleware, addBrand);

router.get('/all/brands', authMiddleware, getUserBrands);


router.get('/:id', getBrandById);


router.put('/update/:id/brand', authMiddleware, updateBrand);

router.delete('/delbrand/:id', authMiddleware, deleteBrand);

export default router;
