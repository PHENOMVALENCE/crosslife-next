import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { sendPrayerNotification } from '@/lib/email/mailer';
import { rateLimitAllow } from '@/lib/rate-limit';
import { sanitize } from '@/lib/utils/media';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anon';
    if (!(await rateLimitAllow(`prayer:${ip}`, 5, 3600))) {
      return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 });
    }

    const body = await request.json();
    const name = sanitize(body.name || '');
    const email = sanitize(body.email || '');
    const phone = sanitize(body.phone || '');
    const requestType = sanitize(body.request_type || 'general');
    const message = sanitize(body.message || '');

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill in your name and prayer request.' },
        { status: 400 }
      );
    }

    await execute(
      "INSERT INTO prayer_requests (name, email, phone, request_type, message, status) VALUES (?, ?, ?, ?, ?, 'new')",
      [name, email, phone, requestType, message]
    );

    await sendPrayerNotification({ name, message });

    return NextResponse.json({
      success: true,
      message: 'Your prayer request has been received. Our team will be praying with you.',
    });
  } catch (error) {
    console.error('Prayer request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit prayer request. Please try again.' },
      { status: 500 }
    );
  }
}
