import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { googleAuthUrl, googleOAuthConfigured } from '@/lib/google-oauth';
import { getSession } from '@/lib/auth/get-session';

export async function GET() {
  if (!googleOAuthConfigured()) {
    return NextResponse.redirect(new URL('/student/login?error=google_not_configured', process.env.SITE_URL || 'http://localhost:3000'));
  }
  const state = randomBytes(16).toString('hex');
  const session = await getSession();
  session.oauthState = state;
  await session.save();
  return NextResponse.redirect(googleAuthUrl(state));
}
