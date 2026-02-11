import * as paymentService from './service.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;
    const result = await paymentService.createPaymentIntent(orderId, method);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    await paymentService.handleStripeWebhook(signature, req.body);

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};



export const verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const result = await paymentService.verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};