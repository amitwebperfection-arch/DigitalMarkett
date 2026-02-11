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

// ✅ CHANGE THIS FUNCTION
export const getDashboard = async (req, res, next) => {
  try {
    // Change from getVendorDashboard to getVendorDashboard (check your service.js exports)
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

    // ✅ Check bank details
    if (!user.hasBankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please add bank details first'
      });
    }

    // ✅ Get wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet || wallet.balance < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is $10'
      });
    }

    // ✅ Import payoutService at top of file
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

    // ✅ Validation
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

    // ✅ Update bank details
    user.bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId: upiId || ''
    };

    // ✅ CRITICAL: Set hasBankDetails flag to true
    user.hasBankDetails = true;

    await user.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: user.bankDetails,
      hasBankDetails: user.hasBankDetails  // ✅ Return this
    });
  } catch (error) {
    next(error);
  }
};