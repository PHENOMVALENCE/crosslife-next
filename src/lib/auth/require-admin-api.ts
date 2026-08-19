import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { isAdminLoggedIn, SessionData } from '@/lib/auth/session';
import { AdminRole, hasRole } from '@/lib/auth/admin';

export async function requireAdminApi(
  roles?: AdminRole[]
): Promise<SessionData | NextResponse> {
  const session = await getSession();
  if (!isAdminLoggedIn(session)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (roles && !hasRole(session, roles)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  return session;
}

export function isApiError(result: SessionData | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
