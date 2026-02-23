import express from 'express';
import * as orderController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/create', orderController.createOrder);
router.get('/my', orderController.getMyOrders);

router.get('/vendor', orderController.getVendorOrders);

router.get('/admin', restrictTo('admin'), orderController.getAdminOrders);

export default router;