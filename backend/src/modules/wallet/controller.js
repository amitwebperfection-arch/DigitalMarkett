import * as walletService from './service.js';

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
    const { page = 1, limit = 20 } = req.query;
    const result = await walletService.getTransactionHistory(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// wallet/controller.js
export const initWalletTopup = async (req, res, next) => {
  try {
    const { amount, provider } = req.body;

    const topup = await walletService.createTopup(
      req.user.id,
      amount,
      provider
    );

    let gatewayData;

    if (provider === 'stripe') {
      gatewayData = await createStripePaymentIntent(
        amount,
        'usd',
        { topupId: topup._id.toString() }
      );
    }

    if (provider === 'razorpay') {
      gatewayData = await createRazorpayOrder(
        amount,
        'INR',
        topup._id.toString()
      );
    }

    res.json({ success: true, topupId: topup._id, gatewayData });
  } catch (err) {
    next(err);
  }
};
