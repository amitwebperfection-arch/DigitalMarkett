import * as vendorService from './service.js';
import User from '../users/model.js';

export const applyForVendor = async (req, res, next) => {
  try {
    const { businessName, description } = req.body;
    const user = await vendorService.applyForVendor(req.user.id, businessName, description);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};


export const getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await vendorService.getVendorDashboard(req.user.id);
    res.json({ success: true, ...dashboardData });
  } catch (error) {
    next(error);
  }
};

export const getEarnings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await vendorService.getVendorEarnings(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await vendorService.getVendorReviews(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await vendorService.getVendorPayouts(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasBankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please add bank details first'
      });
    }
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet || wallet.balance < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is $10'
      });
    }

    const payoutService = await import('../payouts/service.js');
    
    const payout = await payoutService.requestPayout(
      req.user.id,
      wallet.balance,
      user.bankDetails?.upiId ? 'upi' : 'bank_transfer',
      user.bankDetails
    );

    res.json({ success: true, payout });
  } catch (error) {
    next(error);
  }
};

export const approveVendor = async (req, res, next) => {
  try {
    const user = await vendorService.approveVendor(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const rejectVendor = async (req, res, next) => {
  try {
    const user = await vendorService.rejectVendor(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateBankDetails = async (req, res, next) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = req.body;

    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Account holder name, bank name, account number, and IFSC code are required'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId: upiId || ''
    };

    user.hasBankDetails = true;

    await user.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: user.bankDetails,
      hasBankDetails: user.hasBankDetails  
    });
  } catch (error) {
    next(error);
  }
};