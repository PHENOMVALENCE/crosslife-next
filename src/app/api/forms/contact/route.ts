import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { sendContactConfirmation, sendContactNotification } from '@/lib/email/mailer';
import { rateLimitAllow } from '@/lib/rate-limit';
import { sanitize } from '@/lib/utils/media';

function json(success: boolean, message: string, status = 200) {
  return NextResponse.json({ success, message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anon';
    if (!(await rateLimitAllow(`contact:${ip}`, 5, 3600))) {
      return json(false, 'Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const name = sanitize(body.name || '');
    const email = sanitize(body.email || '');
    const phone = sanitize(body.phone || '');
    const subject = sanitize(body.subject || '');
    const message = sanitize(body.message || '');

    if (!name || !email || !subject || !message) {
      return json(false, 'Please fill in all required fields.', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(false, 'Please enter a valid email address.', 400);
    }

    await execute(
      "INSERT INTO contact_inquiries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'new')",
      [name, email, phone, subject, message]
    );

    await sendContactNotification({ name, email, phone, subject, message });
    await sendContactConfirmation(email, name);

    return json(true, 'Your message has been sent. Thank you!');
  } catch (error) {
    console.error('Contact form error:', error);
    return json(false, 'Failed to send message. Please try again later.', 500);
  }
}
