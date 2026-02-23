import express from 'express';
import * as couponController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/apply', protect, couponController.applyCoupon);
router.get('/active', protect, couponController.getActiveCoupons); 

router.use(protect, restrictTo('admin'));
router.post('/', couponController.createCoupon);
router.get('/', couponController.getCoupons);
router.delete('/:id', couponController.deleteCoupon);

export default router;