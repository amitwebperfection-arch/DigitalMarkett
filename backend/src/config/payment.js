import Stripe from 'stripe';
import Razorpay from 'razorpay';
import Settings from '../modules/settings/model.js'; 
import {
  STRIPE_SECRET_KEY,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from './env.js';

// ─── DB se payment config lo, fallback .env ───────────────────
const getPaymentConfig = async () => {
  try {
    const settings = await Settings.findOne().lean();
    const pm = settings?.paymentMethods;

    return {
      stripe: {
        enabled:   pm?.stripe?.enabled   ?? false,
        secretKey: pm?.stripe?.secretKey || STRIPE_SECRET_KEY,
        publicKey: pm?.stripe?.publicKey || '',
      },
      razorpay: {
        enabled:   pm?.razorpay?.enabled   ?? false,
        keyId:     pm?.razorpay?.keyId     || RAZORPAY_KEY_ID,
        keySecret: pm?.razorpay?.keySecret || RAZORPAY_KEY_SECRET,
      },
      wallet: { enabled: pm?.wallet?.enabled ?? true },
      cod:    { enabled: pm?.cod?.enabled    ?? false },
    };
  } catch {
    // DB fail to .env fallback
    return {
      stripe:   { enabled: !!STRIPE_SECRET_KEY,    secretKey: STRIPE_SECRET_KEY, publicKey: '' },
      razorpay: { enabled: !!RAZORPAY_KEY_ID,       keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET },
      wallet:   { enabled: true },
      cod:      { enabled: false },
    };
  }
};

// ─── Dynamic Stripe instance ───────────────────────────────────
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover'
});


// ─── Dynamic Razorpay instance ─────────────────────────────────
export const razorpay = async () => {
  const config = await getPaymentConfig();

  if (!config.razorpay.enabled) {
    throw new Error('Razorpay payment is not enabled. Enable it in Admin → Settings → Payment.');
  }
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new Error('Razorpay keys are not configured. Add them in Admin → Settings → Payment.');
  }

  return new Razorpay({
    key_id:     config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
};

// ─── Check if payment method is enabled ───────────────────────
export const isPaymentEnabled = async (method) => {
  const config = await getPaymentConfig();
  return config[method]?.enabled ?? false;
};

// ─── Create Stripe Payment Intent ─────────────────────────────
export const createStripePaymentIntent = async (
  amount,
  currency = 'usd',
  metadata = {}
) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
  });
};


// ─── Create Razorpay Order ─────────────────────────────────────
export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  const razorpayInstance = await razorpay();
  return razorpayInstance.orders.create({
    amount:   Math.round(amount * 100),
    currency,
    receipt,
  });
};

// ─── Get payment config for frontend (no secret keys) ─────────
export const getPublicPaymentConfig = async () => {
  const config = await getPaymentConfig();
  return {
    stripe:   { enabled: config.stripe.enabled,   publicKey: config.stripe.publicKey },
    razorpay: { enabled: config.razorpay.enabled, keyId: config.razorpay.keyId },
    wallet:   { enabled: config.wallet.enabled },
    cod:      { enabled: config.cod.enabled },
  };
};

export default {
  razorpay,
  isPaymentEnabled,
  createStripePaymentIntent,
  createRazorpayOrder,
  getPublicPaymentConfig,
};