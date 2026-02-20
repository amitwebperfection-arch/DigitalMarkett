import { sendEmail as mailSend } from '../config/mail.js'; 

export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><b>Order ID:</b> ${orderDetails.orderId}</p>
    <p><b>Total:</b> ${orderDetails.total}</p>
  `;

  await mailSend({
    to: userEmail,
    subject: 'Order Confirmation',
    html
  });
};

export const sendVendorNotification = async (vendorEmail, productTitle) => {
  const html = `
    <h2>New Sale!</h2>
    <p>Your product "<b>${productTitle}</b>" has been sold.</p>
  `;

  await mailSend({
    to: vendorEmail,
    subject: 'New Sale Notification',
    html
  });
};

export const sendPasswordReset = async (email, resetUrl) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password (expires in 10 minutes):</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  await mailSend({
    to: email,
    subject: 'Password Reset',
    html
  });
};

export const sendContactNotification = async ({ name, email, subject, message }) => {
  await sendEmail({
    to: FROM_EMAIL, 
    subject: `New Contact: ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `
  });
};
