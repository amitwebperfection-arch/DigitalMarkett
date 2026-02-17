import nodemailer from 'nodemailer';
import Settings from '../modules/settings/model.js'; 
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME } from './env.js';

// ─── DB se SMTP config lo, fallback .env ──────────────────────
const getSmtpConfig = async () => {
  try {
    const settings = await Settings.findOne().lean();
    const smtp = settings?.smtp;

    // DB mein values hain to woh use karo, warna .env
    return {
      host:      smtp?.host      || SMTP_HOST,
      port:      smtp?.port      || SMTP_PORT      || 587,
      user:      smtp?.user      || SMTP_USER,
      pass:      smtp?.pass      || SMTP_PASS,
      fromEmail: smtp?.fromEmail || FROM_EMAIL,
      fromName:  smtp?.fromName  || FROM_NAME      || 'Digital Marketplace',
      footerText: smtp?.emailFooterText || '',
    };
  } catch {
    // DB fail ho to .env fallback
    return {
      host:      SMTP_HOST,
      port:      SMTP_PORT || 587,
      user:      SMTP_USER,
      pass:      SMTP_PASS,
      fromEmail: FROM_EMAIL,
      fromName:  FROM_NAME || 'Digital Marketplace',
      footerText: '',
    };
  }
};

// ─── Email Notifications check karo ───────────────────────────
export const isNotificationEnabled = async (type) => {
  try {
    const settings = await Settings.findOne().lean();
    const notifs = settings?.emailNotifications;
    if (!notifs) return true; // default ON

    const map = {
      orderConfirmation:  notifs.orderConfirmation,
      vendorNotification: notifs.vendorNotification,
      payoutNotification: notifs.payoutNotification,
      welcomeEmail:       notifs.welcomeEmail,
    };
    return map[type] !== false; // undefined = true (default ON)
  } catch {
    return true;
  }
};

// ─── Main sendEmail function ───────────────────────────────────
export const sendEmail = async ({ to, subject, html, text, type = null }) => {
  // Agar type diya hai to check karo notification enabled hai ya nahi
  if (type) {
    const enabled = await isNotificationEnabled(type);
    if (!enabled) {
      console.log(`📧 Email skipped — ${type} notifications are OFF in settings`);
      return;
    }
  }

  const config = await getSmtpConfig();

  // Transporter dynamically banao har email pe (fresh config)
  const transporter = nodemailer.createTransport({
    host:   config.host,
    port:   Number(config.port),
    secure: Number(config.port) === 465, // 465 = SSL, baaki TLS
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  // Footer text HTML mein append karo
  const footerHtml = config.footerText
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">${config.footerText}</div>`
    : '';

  const finalHtml = html ? `${html}${footerHtml}` : undefined;

  const mailOptions = {
    from:    `${config.fromName} <${config.fromEmail}>`,
    to,
    subject,
    text,
    html: finalHtml,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to} — subject: "${subject}"`);
};

export default { sendEmail, isNotificationEnabled };