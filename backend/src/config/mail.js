import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import Settings from '../modules/settings/model.js';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME, RESEND_API_KEY } from './env.js';

const getSmtpConfig = async () => {
  try {
    const settings = await Settings.findOne().lean();
    const smtp = settings?.smtp;
    return {
      host:      smtp?.host      || SMTP_HOST,
      port:      smtp?.port      || SMTP_PORT || 587,
      user:      smtp?.user      || SMTP_USER,
      pass:      smtp?.pass      || SMTP_PASS,
      fromEmail: smtp?.fromEmail || FROM_EMAIL,
      fromName:  smtp?.fromName  || FROM_NAME || 'Digital Marketplace',
      footerText: smtp?.emailFooterText || '',
    };
  } catch {
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

export const isNotificationEnabled = async (type) => {
  try {
    const settings = await Settings.findOne().lean();
    const notifs = settings?.emailNotifications;
    if (!notifs) return true;
    const map = {
      orderConfirmation:  notifs.orderConfirmation,
      vendorNotification: notifs.vendorNotification,
      payoutNotification: notifs.payoutNotification,
      welcomeEmail:       notifs.welcomeEmail,
    };
    return map[type] !== false;
  } catch {
    return true;
  }
};

// ─── Resend HTTP API (primary) ─────────────────────────────────
const sendViaResend = async ({ to, subject, html, text, fromName, fromEmail, footerHtml }) => {
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html: html ? `${html}${footerHtml}` : undefined,
    text,
  });
  if (error) throw new Error(error.message);
};

// ─── Nodemailer SMTP (fallback) ────────────────────────────────
const sendViaNodemailer = async ({ to, subject, html, text, config, footerHtml }) => {
  const transporter = nodemailer.createTransport({
    host:   config.host,
    port:   Number(config.port),
    secure: Number(config.port) === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  await transporter.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to,
    subject,
    text,
    html: html ? `${html}${footerHtml}` : undefined,
  });
};

// ─── Main sendEmail function ───────────────────────────────────
export const sendEmail = async ({ to, subject, html, text, type = null }) => {
  if (type) {
    const enabled = await isNotificationEnabled(type);
    if (!enabled) {
      console.log(`📧 Email skipped — ${type} notifications are OFF`);
      return;
    }
  }

  const config = await getSmtpConfig();

  const footerHtml = config.footerText
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">${config.footerText}</div>`
    : '';

  if (RESEND_API_KEY) {
    try {
      await sendViaResend({
        to, subject, html, text,
        fromName: config.fromName,
        fromEmail: 'onboarding@resend.dev', 
        footerHtml,
      });
      console.log(`📧 [Resend] Email sent to ${to} — "${subject}"`);
      return;
    } catch (err) {
      console.warn('📧 Resend failed, trying Nodemailer...', err.message);
    }
  }

  // ✅ Fallback: Nodemailer
  await sendViaNodemailer({ to, subject, html, text, config, footerHtml });
  console.log(`📧 [Nodemailer] Email sent to ${to} — "${subject}"`);
};

export default { sendEmail, isNotificationEnabled };
