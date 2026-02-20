import { stripe, razorpay, createStripePaymentIntent, createRazorpayOrder } from '../../config/payment.js';
import Order from '../orders/model.js';
import { completeOrder } from '../orders/service.js';
import WalletTopup from '../wallet/walletTopup.model.js';
import { addFunds } from '../wallet/service.js';

export const createPaymentIntent = async (orderId, method = 'stripe') => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (method === 'stripe') {
    const paymentIntent = await createStripePaymentIntent(
      order.total, 'usd', { orderId: order._id.toString() }
    );
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };

  } else if (method === 'razorpay') {
    const razorpayOrder = await createRazorpayOrder(
      order.total, 'INR', order._id.toString()
    );
    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    };

  } else if (method === 'wallet') {
    const { deductFunds } = await import('../wallet/service.js');
    await deductFunds(
      order.user.toString(),
      order.total,
      `Order #${order._id.toString().slice(-8).toUpperCase()}`
    );
    await completeOrder(orderId, 'wallet-payment');
    return { success: true };
  }
};

export const handleStripeWebhook = async (signature, rawBody) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Invalid Stripe signature:', err.message);
    throw err;
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;

      if (pi.metadata?.orderId) {
        await completeOrder(pi.metadata.orderId, pi.id);
      }

      if (pi.metadata?.topupId) {
        const topup = await WalletTopup.findById(pi.metadata.topupId);
        if (!topup || topup.status === 'success') return { received: true };

        topup.status = 'success';
        topup.providerPaymentId = pi.id;
        await topup.save();

        await addFunds(topup.user, topup.amount, 'Wallet Topup');
      }
    }

    return { received: true };
  } catch (err) {
    console.error('⚠️ Webhook processing error:', err.message);
    return { received: true };
  }
};



export const verifyRazorpayPayment = async (
  orderId,
  paymentId,
  signature
) => {
  const crypto = await import('crypto');

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error('Invalid payment signature');
  }

  const topup = await WalletTopup.findOne({
    providerOrderId: orderId
  });

  if (!topup || topup.status === 'success') return;

  topup.status = 'success';
  topup.providerPaymentId = paymentId;
  await topup.save();

  await addFunds(topup.user, topup.amount, 'Wallet Topup');

  return { verified: true };
};


