import * as payoutService from './service.js';
import Wallet from '../wallet/model.js';

export const requestPayout = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.hasBankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please add bank details first'
      });
    }

    const Settings = (await import('../settings/model.js')).default;
    const settings = await Settings.findOne().lean();
    const minPayout = settings?.payoutThreshold || 10;

    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet || wallet.balance < minPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is $${minPayout}`
      });
    }

    const payout = await payoutService.requestPayout(
      req.user.id,
      wallet.balance,
      user.bankDetails?.upiId ? 'upi' : 'bank_transfer',
      user.bankDetails
    );

    res.status(201).json({ success: true, payout });
  } catch (error) {
    next(error);
  }
};

export const getMyPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await payoutService.getVendorPayouts(
      req.user.id, 
      Number(page), 
      Number(limit)
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAllPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await payoutService.getAllPayouts(
      Number(page), 
      Number(limit), 
      status
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const processPayout = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const payout = await payoutService.processPayout(
      req.params.id, 
      req.user.id, 
      status, 
      notes
    );
    res.json({ success: true, payout });
  } catch (error) {
    next(error);
  }
};