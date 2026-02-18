import Wallet from './model.js';
import WalletTopup from './walletTopup.model.js';
import { createRazorpayOrder, createStripePaymentIntent } from '../../config/payment.js';

export const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) wallet = await Wallet.create({ user: userId, balance: 0 });
  return wallet;
};

export const addFunds = async (userId, amount, description = 'Funds added') => {
  return await Wallet.findOneAndUpdate(
    { user: userId },
    {
      $inc: { balance: amount },
      $push: {
        transactions: {
          type: 'credit',
          amount,
          description,
          createdAt: new Date()
        }
      }
    },
    { upsert: true, new: true }
  );
};

export const deductFunds = async (userId, amount, description = 'Payment deducted') => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet || wallet.balance < amount) throw new Error('Insufficient wallet balance');

  wallet.balance -= amount;
  wallet.transactions.push({ type: 'debit', amount, description, createdAt: new Date() });
  await wallet.save();
  return wallet;
};

export const getTransactionHistory = async (userId, page = 1, limit = 10) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) return { transactions: [], total: 0, page, totalPages: 0, balance: 0 };

  const allTransactions = [...wallet.transactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const transactions = allTransactions.slice((page - 1) * limit, page * limit);

  return {
    transactions,
    total: wallet.transactions.length,
    page,
    totalPages: Math.ceil(wallet.transactions.length / limit),
    balance: wallet.balance,
    currency: 'INR'
  };
};

export const createTopup = async (userId, amount, provider) => {
  return WalletTopup.create({ user: userId, amount, provider, status: 'pending' });
};

// ✅ Updated - provider parameter support
export const createWalletOrder = async (userId, amount, currency, provider) => {
  const resolvedProvider = provider || (currency === 'INR' ? 'razorpay' : 'stripe');

  const topup = await WalletTopup.create({
    user: userId,
    amount,
    currency,
    provider: resolvedProvider,
    status: 'pending'
  });

  let order;

  if (resolvedProvider === 'razorpay') {
    order = await createRazorpayOrder(amount, currency, topup._id.toString());
    topup.providerOrderId = order.id;
    await topup.save();
  }

  if (resolvedProvider === 'stripe') {
    order = await createStripePaymentIntent(amount, currency.toLowerCase(), {
      topupId: topup._id.toString()
    });
    topup.providerOrderId = order.id;
    await topup.save();
  }

  return { topup, order };
};