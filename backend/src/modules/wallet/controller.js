import * as walletService from './service.js';
import { getPublicPaymentConfig } from '../../config/payment.js';

export const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
};

export const addFunds = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const wallet = await walletService.addFunds(req.user.id, amount, description);
    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await walletService.getTransactionHistory(
      req.user.id,
      Number(page),
      Number(limit)
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const initWalletTopup = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', provider } = req.body;

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Check payment config
    const config = await getPublicPaymentConfig();

    // Provider determine karo
    let resolvedProvider = provider;
    if (!resolvedProvider) {
      resolvedProvider = currency === 'INR' ? 'razorpay' : 'stripe';
    }

    // Check if provider is enabled
    if (resolvedProvider === 'razorpay' && !config.razorpay?.enabled) {
      return res.status(400).json({ success: false, message: 'Razorpay is not enabled' });
    }
    if (resolvedProvider === 'stripe' && !config.stripe?.enabled) {
      return res.status(400).json({ success: false, message: 'Stripe is not enabled' });
    }

    const { topup, order } = await walletService.createWalletOrder(
      req.user.id,
      Number(amount),
      currency,
      resolvedProvider
    );

    // Response
    if (resolvedProvider === 'razorpay') {
      return res.json({
        success: true,
        provider: 'razorpay',
        topupId: topup._id,
        orderId: order.id,
        amount: order.amount / 100, // paise → rupees
        currency: order.currency,
        key: config.razorpay.keyId, // ✅ Public key
      });
    }

    if (resolvedProvider === 'stripe') {
      return res.json({
        success: true,
        provider: 'stripe',
        topupId: topup._id,
        clientSecret: order.client_secret,
        amount: Number(amount),
        currency,
      });
    }

  } catch (err) {
    console.error('Wallet topup error:', err.message);
    next(err);
  }
};