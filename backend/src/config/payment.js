import Stripe from 'stripe';
import Razorpay from 'razorpay';
import {
  STRIPE_SECRET_KEY,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET
} from './env.js';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover'
});

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

export const createStripePaymentIntent = async (
  amount,
  currency = 'usd',
  metadata = {}
) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata
  });
};

export const createRazorpayOrder = async (
  amount,
  currency = 'INR',
  receipt
) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt
  });
};
