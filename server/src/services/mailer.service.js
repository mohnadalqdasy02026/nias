import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const isConfigured = () => Boolean(env.SMTP_HOST);

function getTransporter() {
  if (!isConfigured()) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });
}

/**
 * Sends an email. When SMTP is not configured the message is logged with the
 * brand "MAIL" so developers can still read it locally. Sending failures are
 * logged but never thrown — the caller should not fail a user flow because a
 * notification email could not go out.
 */
export async function sendMail({ to, subject, html, text }) {
  const message = { from: env.EMAIL_FROM, to, subject, html, text };
  if (!isConfigured()) {
    logger.info({ message }, '[mail] SMTP not configured; email logged instead');
    return { logged: true };
  }
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(message);
    logger.info({ to, messageId: info.messageId }, '[mail] sent');
    return { messageId: info.messageId };
  } catch (err) {
    logger.error({ err, to, subject }, '[mail] send failed');
    return { logged: false, error: err };
  }
}

export function buildResetEmail({ resetUrl, nameAr }) {
  const html = `
    <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e3eae7;border-radius:12px;background:#ffffff">
      <h2 style="color:#062b24;margin-top:0">استعادة كلمة المرور — المعهد الوطني للعلوم الإدارية</h2>
      <p style="color:#17211f;line-height:1.8">مرحبًا${nameAr ? ` ${nameAr}` : ''}،</p>
      <p style="color:#17211f;line-height:1.8">نستلمنا طلبك لاستعادة كلمة المرور. اضغط الزر أدناه لاختيار كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#0e7c66;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700">إعادة تعيين كلمة المرور</a>
      </p>
      <p style="color:#5b6b67;font-size:0.85rem;line-height:1.7">إذا لم تطلب ذلك يمكنك تجاهل هذه الرسالة. الرابط يُستخدم مرة واحدة فقط.<br/>المعهد الوطني للعلوم الإدارية — الجمهورية اليمنية.</p>
    </div>`;
  const text = [
    'استعادة كلمة المرور — المعهد الوطني للعلوم الإدارية',
    '',
    `رابط إعادة التعيين (صالح لمدة ساعة): ${resetUrl}`,
  ].join('\n');
  return { html, text };
}

export function buildContactNotificationEmail(message) {
  const html = `
    <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e3eae7;border-radius:12px;background:#ffffff">
      <h2 style="color:#062b24;margin-top:0">رسالة جديدة من نموذج التواصل</h2>
      <table style="width:100%;border-collapse:collapse;color:#17211f;line-height:1.8" cellspacing="0">
        <tr><td style="padding:6px 0;font-weight:700;color:#5b6b67">الاسم</td><td>${message.name}</td></tr>
        <tr><td style="padding:6px 0;font-weight:700;color:#5b6b67">البريد</td><td dir="ltr">${message.email}</td></tr>
        ${message.phone ? `<tr><td style="padding:6px 0;font-weight:700;color:#5b6b67">الجوال</td><td dir="ltr">${message.phone}</td></tr>` : ''}
        ${message.subject ? `<tr><td style="padding:6px 0;font-weight:700;color:#5b6b67">الموضوع</td><td>${message.subject}</td></tr>` : ''}
        <tr><td style="padding:6px 0;font-weight:700;color:#5b6b67">الرسالة</td><td>${message.message}</td></tr>
      </table>
    </div>`;
  const text = [
    'رسالة جديدة من نموذج التواصل',
    '',
    `الاسم: ${message.name}`,
    `البريد: ${message.email}`,
    message.phone ? `الجوال: ${message.phone}` : '',
    message.subject ? `الموضوع: ${message.subject}` : '',
    '',
    message.message,
  ].filter(Boolean).join('\n');
  return { html, text };
}