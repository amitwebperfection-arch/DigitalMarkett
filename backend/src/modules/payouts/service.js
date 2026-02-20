import Payout from './model.js';
import Wallet from '../wallet/model.js';
import User from '../auth/model.js';

export const requestPayout = async (vendorId, amount, method, accountDetails) => {
  const wallet = await Wallet.findOne({ user: vendorId });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (amount < 10) {
    throw new Error('Minimum payout amount is $10');
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient available balance');
  }

  wallet.balance -= amount;
  wallet.lockedBalance += amount;
  await wallet.save();

  const payout = await Payout.create({
    vendor: vendorId,
    amount,
    method,
    accountDetails,
    status: 'pending'
  });

  const { sendEmail: mailSend } = await import('../../config/mail.js');
  const Settings = (await import('../settings/model.js')).default;
  const settings = await Settings.findOne().lean();
  const adminEmail = settings?.siteEmail;

  if (adminEmail) {
    mailSend({
      to: adminEmail,
      subject: `New Payout Request - $${amount}`,
      html: `<h2>New Payout Request</h2>
        <p>A vendor has requested a payout.</p>
        <p><b>Amount:</b> $${amount}</p>
        <p><b>Method:</b> ${method}</p>
        <p>Please process it in the admin panel.</p>`
    }).catch(console.error);
  }

  return payout;
};



export const getVendorPayouts = async (vendorId, page = 1, limit = 10) => {
  const user = await User.findById(vendorId).select('hasBankDetails bankDetails');
  
  const wallet = await Wallet.findOne({ user: vendorId });
  const availableBalance = wallet?.balance || 0;

  const payouts = await Payout.find({ vendor: vendorId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Payout.countDocuments({ vendor: vendorId });

  return { 
    payouts, 
    total, 
    page, 
    totalPages: Math.ceil(total / limit),
    availableBalance,
    hasBankDetails: user?.hasBankDetails || false,
    bankDetails: user?.bankDetails || null  
  };
};

export const getAllPayouts = async (page = 1, limit = 10, status = null) => {
  const query = status ? { status } : {};

  const payouts = await Payout.find(query)
    .populate('vendor', 'name email vendorInfo.businessName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Payout.countDocuments(query);

  return { payouts, total, page, pages: Math.ceil(total / limit) };
};

export const processPayout = async (payoutId, adminId, status, notes = '') => {
  const payout = await Payout.findById(payoutId);

  if (!payout) {
    throw new Error('Payout not found');
  }

  if (payout.status !== 'pending') {
    throw new Error('Payout already processed');
  }

  if (status === 'completed') {
    await Wallet.findOneAndUpdate(
      { user: payout.vendor },
      {
        $inc: { lockedBalance: -payout.amount },
        $push: {
          transactions: {
            type: 'debit',
            amount: payout.amount,
            description: 'Payout completed',
            reference: payout._id.toString(),
            createdAt: new Date()
          }
        }
      }
    );
  }

  if (status === 'rejected') {
    await Wallet.findOneAndUpdate(
      { user: payout.vendor },
      {
        $inc: {
          balance: payout.amount,
          lockedBalance: -payout.amount
        }
      }
    );
  }

  payout.status = status;
  payout.processedAt = new Date();
  payout.processedBy = adminId;
  payout.notes = notes;
  await payout.save();

  const vendor = await User.findById(payout.vendor).select('email');
  if (vendor?.email) {
    const { sendPayoutStatusEmail } = await import('../../services/email.service.js');
    sendPayoutStatusEmail(vendor.email, payout.amount, status, notes).catch(console.error);
  }

  return payout;
};