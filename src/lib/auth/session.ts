import { SessionOptions } from 'iron-session';
import { env } from '../env';

export interface AdminSession {
  adminId?: number;
  adminUsername?: string;
  adminName?: string;
  adminRole?: string;
  lastActivity?: number;
}

export interface StudentSession {
  studentId?: number;
  studentEmail?: string;
  studentName?: string;
  studentStatus?: string;
  authMode?: 'normal' | 'master';
  lastActivity?: number;
  oauthState?: string;
}

export type SessionData = AdminSession & StudentSession;

export const sessionOptions: SessionOptions = {
  password: env('SESSION_SECRET', 'crosslife-dev-session-secret-min-32-chars!!'),
  cookieName: 'crosslife_session',
  cookieOptions: {
    secure: env('APP_ENV') === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60,
  },
};

export function isAdminLoggedIn(session: SessionData): boolean {
  return Boolean(session.adminId);
}

export function isStudentLoggedIn(session: SessionData): boolean {
  return Boolean(session.studentId);
}
