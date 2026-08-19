import { SessionData } from './session';

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'discipleship_admin';

export function getAdminRole(session: SessionData): AdminRole | null {
  return (session.adminRole as AdminRole) || null;
}

export function isSuperAdmin(session: SessionData): boolean {
  return session.adminRole === 'super_admin';
}

export function isDiscipleshipAdmin(session: SessionData): boolean {
  return session.adminRole === 'discipleship_admin';
}

export function canAccessGeneral(session: SessionData): boolean {
  return ['super_admin', 'admin', 'editor'].includes(session.adminRole || '');
}

export function canAccessDiscipleship(session: SessionData): boolean {
  return ['super_admin', 'admin', 'discipleship_admin'].includes(session.adminRole || '');
}

export function hasRole(session: SessionData, roles: AdminRole[]): boolean {
  const role = getAdminRole(session);
  return role !== null && roles.includes(role);
}

export const CONTENT_ROLES: AdminRole[] = ['super_admin', 'admin', 'editor'];
export const DISCIPLESHIP_ROLES: AdminRole[] = ['super_admin', 'admin', 'discipleship_admin'];
export const COMMS_ROLES: AdminRole[] = ['super_admin', 'admin', 'editor'];
