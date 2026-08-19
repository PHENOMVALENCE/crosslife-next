import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL('/student/login', process.env.SITE_URL || 'http://localhost:3000'));
}
