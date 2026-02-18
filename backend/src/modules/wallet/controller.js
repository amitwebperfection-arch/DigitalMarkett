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
    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    const { topup, order } = await walletService.createWalletOrder(
      req.user.id, Number(amount), currency, provider
    );

    if (provider === 'razorpay') {
      const config = await getPublicPaymentConfig();
      return res.json({
        success: true,
        provider: 'razorpay',
        topupId: topup._id,
        orderId: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        key: config.razorpay.keyId,  // ✅ Public key
      });
    }

    if (provider === 'stripe') {
      return res.json({
        success: true,
        provider: 'stripe',
        topupId: topup._id,
        clientSecret: order.client_secret,  // ✅ Stripe secret
      });
    }
  } catch (err) { next(err); }
};