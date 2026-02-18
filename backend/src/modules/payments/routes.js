import express from 'express';
import * as paymentController from './controller.js';
import { protect } from '../../middlewares/auth.js';
import { getPublicPaymentConfig } from '../../config/payment.js';

const router = express.Router();

// ✅ Public route - no auth needed
router.get('/config', async (req, res, next) => {
  try {
    const config = await getPublicPaymentConfig();
    res.json({ success: true, ...config });
  } catch (err) {
    next(err);
  }
});

router.post('/create-intent', protect, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.stripeWebhook);
router.post('/verify-razorpay', protect, paymentController.verifyRazorpay);

export default router;