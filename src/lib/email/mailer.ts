import nodemailer from 'nodemailer';
import { env, envBool } from '../env';
import { siteUrl } from '../upload';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = env('MAIL_HOST');
  const user = env('MAIL_USERNAME');
  const pass = env('MAIL_PASSWORD');
  if (!host || !user) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port: Number(env('MAIL_PORT', '587')),
    secure: env('MAIL_ENCRYPTION') === 'ssl',
    auth: { user, pass },
  });
  return transporter;
}

function fromHeader() {
  return {
    from: `"${env('MAIL_FROM_NAME', 'CrossLife Mission Network')}" <${env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME'))}>`,
    replyTo: env('MAIL_REPLY_TO', env('MAIL_FROM_ADDRESS')),
  };
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  if (!envBool('MAIL_ENABLE_SIGNUP', true) && !envBool('MAIL_ENABLE_PASSWORD_RESET', true)) {
    // still allow if any mail flag - check per-call in wrappers
  }
  const t = getTransporter();
  if (!t) {
    console.warn('Mail not configured — skipping send to', options.to);
    return false;
  }
  try {
    await t.sendMail({ ...fromHeader(), to: options.to, subject: options.subject, html: options.html, text: options.text || options.html.replace(/<[^>]+>/g, '') });
    return true;
  } catch (e) {
    console.error('Mail send failed:', e);
    return false;
  }
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const admin = env('MAIL_ADMIN_ADDRESS', env('MAIL_FROM_ADDRESS'));
  if (!admin) return false;
  return sendMail({
    to: admin,
    subject: `[Contact] ${data.subject}`,
    html: `<p><strong>${data.name}</strong> (${data.email})</p><p>${data.message}</p>`,
  });
}

export async function sendContactConfirmation(email: string, name: string) {
  return sendMail({
    to: email,
    subject: 'We received your message — CrossLife Mission Network',
    html: `<p>Dear ${name},</p><p>Thank you for contacting CrossLife Mission Network. We have received your message and will respond soon.</p>`,
  });
}

export async function sendRegistrationWelcome(student: { email: string; full_name: string }) {
  if (!envBool('MAIL_ENABLE_SIGNUP', true)) return false;
  return sendMail({
    to: student.email,
    subject: 'Registration received — School of Christ Academy',
    html: `<p>Dear ${student.full_name},</p><p>Your registration has been submitted. An administrator will review and approve your account before you can sign in.</p><p><a href="${siteUrl()}/student/login">Sign in</a></p>`,
  });
}

export async function sendAccountApproved(student: { email: string; full_name: string }) {
  if (!envBool('MAIL_ENABLE_ACCOUNT_APPROVED', true)) return false;
  return sendMail({
    to: student.email,
    subject: 'Your account has been approved — School of Christ Academy',
    html: `<p>Dear ${student.full_name},</p><p>Your School of Christ Academy account is now active. You may sign in and enroll in programs.</p><p><a href="${siteUrl()}/student/login">Sign in now</a></p>`,
  });
}

export async function sendCourseCompletion(
  student: { email: string; full_name: string },
  programName: string,
  enrollmentId: number
) {
  if (!envBool('MAIL_ENABLE_COMPLETION', true)) return false;
  const certUrl = `${siteUrl()}/student/certificate/${enrollmentId}`;
  return sendMail({
    to: student.email,
    subject: `Program completed — ${programName}`,
    html: `<p>Congratulations ${student.full_name}!</p><p>You have completed <strong>${programName}</strong>.</p><p><a href="${certUrl}">View your certificate status</a></p>`,
  });
}

export async function sendPrayerNotification(data: { name: string; message: string }) {
  const admin = env('MAIL_ADMIN_ADDRESS');
  if (!admin) return false;
  return sendMail({
    to: admin,
    subject: '[Prayer Request] New submission',
    html: `<p>From: ${data.name}</p><p>${data.message}</p>`,
  });
}

export async function sendNewsletterWelcome(email: string) {
  return sendMail({
    to: email,
    subject: 'Welcome to the CrossLife newsletter',
    html: `<p>Thank you for subscribing to CrossLife Mission Network updates.</p>`,
  });
}
