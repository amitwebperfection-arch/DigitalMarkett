import express from 'express';
import * as reviewController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';
import { validateReview } from './validation.js';

const router = express.Router();

router.get('/:productId', reviewController.getProductReviews);

router.use(protect);
router.post('/', validateReview,  reviewController.createReview);

router.delete('/:id', restrictTo('admin'), reviewController.deleteReview);

router.post('/recalculate/:productId', restrictTo('admin'), reviewController.recalculateRating);

export default router;