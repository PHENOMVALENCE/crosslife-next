import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, query } from '@/lib/db';
import { sendRegistrationWelcome } from '@/lib/email/mailer';
import { RowDataPacket } from 'mysql2';
import { sanitize } from '@/lib/utils/media';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = sanitize(body.email || '').toLowerCase();
    const password = String(body.password || '');
    const fullName = sanitize(body.full_name || '');
    const phone = sanitize(body.phone || '');

    if (!email || !password || !fullName) {
      return NextResponse.json({ success: false, message: 'Please fill in email, full name, and password.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await query<RowDataPacket[]>('SELECT id FROM discipleship_students WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    await execute(
      "INSERT INTO discipleship_students (email, password_hash, full_name, phone, status) VALUES (?, ?, ?, ?, 'pending')",
      [email, hash, fullName, phone || null]
    );

    await sendRegistrationWelcome({ email, full_name: fullName });

    return NextResponse.json({
      success: true,
      message:
        'Registration submitted! An admin must approve your account before you can sign in.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 500 });
  }
}
