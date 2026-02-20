import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from './controller.js';
import { protect } from '../../middlewares/auth.js';
import asyncHandler from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.use(protect); 

router.get('/', getWishlist);
router.post('/', asyncHandler(addToWishlist)); 
router.delete('/:productId', asyncHandler(removeFromWishlist));

export default router;
