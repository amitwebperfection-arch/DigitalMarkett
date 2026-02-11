import express from 'express';
import * as paymentController from './controller.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/create-intent', protect, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.stripeWebhook);
router.post('/verify-razorpay', protect, paymentController.verifyRazorpay);

export default router;