import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { sendNewsletterWelcome } from '@/lib/email/mailer';
import { rateLimitAllow } from '@/lib/rate-limit';
import { RowDataPacket } from 'mysql2';
import { sanitize } from '@/lib/utils/media';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anon';
    if (!(await rateLimitAllow(`newsletter:${ip}`, 3, 3600))) {
      return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 });
    }

    const body = await request.json();
    const email = sanitize(body.email || '').toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    const existing = await query<RowDataPacket[]>(
      'SELECT id FROM newsletter_subscriptions WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to the CrossLife newsletter.',
      });
    }

    await execute(
      "INSERT INTO newsletter_subscriptions (email, status, subscribed_at) VALUES (?, 'active', NOW())",
      [email]
    );

    await sendNewsletterWelcome(email);

    return NextResponse.json({
      success: true,
      message: 'You have been subscribed to the CrossLife newsletter. Thank you for staying connected!',
    });
  } catch (error) {
    console.error('Newsletter form error:', error);
    return NextResponse.json(
      { success: false, message: 'Subscription failed. Please try again.' },
      { status: 500 }
    );
  }
}
