import { sendEmail as mailSend } from '../config/mail.js'; 
import Settings from '../modules/settings/model.js';

// Helper — admin email DB se lo
const getAdminEmail = async () => {
  const settings = await Settings.findOne().lean();
  return settings?.siteEmail || process.env.FROM_EMAIL;
};

export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  await mailSend({
    to: userEmail,
    subject: 'Order Confirmation',
    html: `<h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><b>Order ID:</b> ${orderDetails.orderId}</p>
      <p><b>Total:</b> ${orderDetails.total}</p>`
  });
};

export const sendVendorNotification = async (vendorEmail, productTitle) => {
  await mailSend({
    to: vendorEmail,
    subject: 'New Sale Notification',
    html: `<h2>New Sale!</h2>
      <p>Your product "<b>${productTitle}</b>" has been sold.</p>`
  });
};

// ✅ Product approved/rejected notification
export const sendProductStatusEmail = async (vendorEmail, productTitle, status) => {
  const approved = status === 'approved';
  await mailSend({
    to: vendorEmail,
    subject: `Product ${approved ? 'Approved' : 'Rejected'} - ${productTitle}`,
    html: `<h2>Product ${approved ? '✅ Approved' : '❌ Rejected'}</h2>
      <p>Your product "<b>${productTitle}</b>" has been ${status}.</p>
      ${approved ? '<p>It is now live on the marketplace!</p>' : '<p>Please contact support for more info.</p>'}`
  });
};

// ✅ Payout status notification
export const sendPayoutStatusEmail = async (vendorEmail, amount, status, notes = '') => {
  const completed = status === 'completed';
  await mailSend({
    to: vendorEmail,
    subject: `Payout ${completed ? 'Processed' : 'Rejected'} - $${amount}`,
    html: `<h2>Payout ${completed ? '✅ Completed' : '❌ Rejected'}</h2>
      <p>Your payout request of <b>$${amount}</b> has been ${status}.</p>
      ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}`
  });
};

// ✅ Wallet topup success
export const sendWalletTopupEmail = async (userEmail, amount, currency) => {
  await mailSend({
    to: userEmail,
    subject: 'Wallet Topped Up Successfully',
    html: `<h2>💰 Wallet Updated</h2>
      <p>Your wallet has been credited with <b>${currency} ${amount}</b>.</p>`
  });
};

// ✅ Contact form
export const sendContactNotification = async ({ name, email, subject, message }) => {
  const adminEmail = await getAdminEmail();
  await mailSend({
    to: adminEmail,
    subject: `New Contact: ${subject}`,
    html: `<h2>New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p><p>${message}</p>`
  });
};

export const sendPasswordReset = async (email, resetUrl) => {
  await mailSend({
    to: email,
    subject: 'Password Reset',
    html: `<h2>Password Reset Request</h2>
      <p>Click below to reset your password (expires in 10 minutes):</p>
      <a href="${resetUrl}">${resetUrl}</a>`
  });
};