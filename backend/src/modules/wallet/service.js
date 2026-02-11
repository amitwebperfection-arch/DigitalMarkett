import Wallet from './model.js';
import WalletTopup from './walletTopup.model.js';
import { createRazorpayOrder, createStripePaymentIntent } from '../../config/payment.js';

export const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }

  return wallet;
};

export const addFunds = async (userId, amount, description = 'Funds added') => {
  const wallet = await Wallet.findOneAndUpdate(
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

  return wallet;
};

export const deductFunds = async (userId, amount, description = 'Payment deducted') => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  wallet.balance -= amount;
  wallet.transactions.push({
    type: 'debit',
    amount,
    description,
    createdAt: new Date()
  });

  await wallet.save();

  return wallet;
};

export const getTransactionHistory = async (userId, page = 1, limit = 20) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    return { transactions: [], total: 0, page, pages: 0 };
  }

  const transactions = wallet.transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice((page - 1) * limit, page * limit);

  return {
    transactions,
    total: wallet.transactions.length,
    page,
    pages: Math.ceil(wallet.transactions.length / limit)
  };
};


export const createTopup = async (userId, amount, provider) => {
  return WalletTopup.create({
    user: userId,
    amount,
    provider,
    status: 'pending'
  });
};




export const createWalletOrder = async (userId, amount, currency) => {
  // Determine provider (e.g., Razorpay for INR)
  const provider = currency === 'INR' ? 'razorpay' : 'stripe'; 

  // Create WalletTopup document
  const topup = await WalletTopup.create({
    user: userId,
    amount,
    currency,  // ✅ Required
    provider,  // ✅ Required
    status: 'pending'
  });

  // Create payment order
  const order = await createRazorpayOrder(amount, currency, topup._id.toString());

  return { topup, order };
};
