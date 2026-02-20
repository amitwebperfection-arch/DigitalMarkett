import express from 'express';
import * as vendorController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/apply', protect, vendorController.applyForVendor);

router.use(protect, restrictTo('vendor'));
router.get('/dashboard', vendorController.getDashboard);
router.get('/earnings', vendorController.getEarnings);
router.get('/reviews', vendorController.getReviews);
router.get('/payouts', vendorController.getPayouts);
router.post('/payouts/request', vendorController.requestPayout);
router.put('/bank-details', vendorController.updateBankDetails);
router.use(restrictTo('admin'));
router.put('/approve/:id', vendorController.approveVendor);
router.put('/reject/:id', vendorController.rejectVendor);

export default router;