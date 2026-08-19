import { redirect } from 'next/navigation';
import { getSession } from './get-session';
import { isAdminLoggedIn, SessionData } from './session';
import { AdminRole, hasRole, isDiscipleshipAdmin } from './admin';

export async function requireAdmin(roles?: AdminRole[]): Promise<SessionData> {
  const session = await getSession();
  if (!isAdminLoggedIn(session)) {
    redirect('/student/login?mode=admin');
  }
  if (roles && !hasRole(session, roles)) {
    redirect(isDiscipleshipAdmin(session) ? '/admin/discipleship' : '/admin');
  }
  return session;
}
