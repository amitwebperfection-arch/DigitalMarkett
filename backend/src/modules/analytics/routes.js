import express from 'express';
import * as analyticsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/admin', restrictTo('admin'), analyticsController.getAdminAnalytics);
router.get('/vendor', restrictTo('vendor'), analyticsController.getVendorAnalytics);

export default router;