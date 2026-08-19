import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { exchangeGoogleCode, fetchGoogleUser, googleOAuthConfigured } from '@/lib/google-oauth';
import { getSession } from '@/lib/auth/get-session';
import { sendRegistrationWelcome, sendMail } from '@/lib/email/mailer';
import { env } from '@/lib/env';
import { RowDataPacket } from 'mysql2';

function redirect(path: string, msg?: string, type = 'danger') {
  const base = env('SITE_URL', 'http://localhost:3000');
  const url = new URL(path, base);
  if (msg) {
    url.searchParams.set('flash', msg);
    url.searchParams.set('flash_type', type);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  if (!googleOAuthConfigured()) {
    return redirect('/student/login', 'Google Sign-In is not configured.');
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  if (error) {
    return redirect('/student/login', error === 'access_denied' ? 'You cancelled the sign-in.' : 'Google sign-in failed.');
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const session = await getSession();

  if (!code || !state || state !== session.oauthState) {
    return redirect('/student/login', 'Invalid Google response.');
  }
  delete session.oauthState;

  const tokenInfo = await exchangeGoogleCode(code);
  if (!tokenInfo.access_token) {
    return redirect('/student/login', 'Could not get access token from Google.');
  }

  const user = await fetchGoogleUser(tokenInfo.access_token);
  if (!user.email) {
    return redirect('/student/login', 'Could not retrieve your profile from Google.');
  }

  const email = user.email.trim().toLowerCase();
  const fullName = (user.name || email).trim();
  const googleId = user.id || '';

  let rows: RowDataPacket[] = [];
  try {
    rows = await query<RowDataPacket[]>(
      'SELECT id, email, full_name, status, google_id FROM discipleship_students WHERE (google_id IS NOT NULL AND google_id = ?) OR email = ? LIMIT 1',
      [googleId, email]
    );
  } catch {
    rows = await query<RowDataPacket[]>(
      'SELECT id, email, full_name, status FROM discipleship_students WHERE email = ? LIMIT 1',
      [email]
    );
  }

  const student = rows[0];
  if (student) {
    if (student.status === 'pending') {
      return redirect('/student/login', 'Your account is pending admin approval.', 'warning');
    }
    if (student.status !== 'active') {
      return redirect('/student/login', 'Your account has been deactivated.');
    }
    try {
      if (googleId && !student.google_id) {
        await execute('UPDATE discipleship_students SET google_id = ?, last_login = NOW() WHERE id = ?', [googleId, student.id]);
      } else {
        await execute('UPDATE discipleship_students SET last_login = NOW() WHERE id = ?', [student.id]);
      }
    } catch {
      await execute('UPDATE discipleship_students SET last_login = NOW() WHERE id = ?', [student.id]);
    }
    session.studentId = Number(student.id);
    session.studentEmail = student.email as string;
    session.studentName = student.full_name as string;
    session.studentStatus = student.status as string;
    session.lastActivity = Date.now();
    await session.save();
    return redirect('/student/dashboard');
  }

  try {
    await execute(
      "INSERT INTO discipleship_students (email, password_hash, full_name, google_id, status) VALUES (?, NULL, ?, ?, 'pending')",
      [email, fullName, googleId || null]
    );
  } catch {
    await execute(
      "INSERT INTO discipleship_students (email, password_hash, full_name, status) VALUES (?, NULL, ?, 'pending')",
      [email, fullName]
    );
  }

  const [newStudent] = await query<RowDataPacket[]>('SELECT id FROM discipleship_students WHERE email = ? LIMIT 1', [email]);
  await sendRegistrationWelcome({ email, full_name: fullName });
  const admin = env('MAIL_ADMIN_ADDRESS');
  if (admin) {
    await sendMail({
      to: admin,
      subject: 'New Google registration pending approval',
      html: `<p><strong>${fullName}</strong> (${email}) signed up with Google and awaits approval.</p>`,
    });
  }

  return redirect(
    '/student/login',
    'Account created with Google. Your registration is pending admin approval.',
    'success'
  );
}
