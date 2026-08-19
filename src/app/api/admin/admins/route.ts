import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>(
    'SELECT id, username, email, full_name, role, status, last_login, created_at FROM admins ORDER BY created_at ASC'
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(['super_admin']);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const username = cleanString(body.username);
  const email = cleanString(body.email);
  const fullName = cleanString(body.full_name);
  const password = String(body.password || '');
  const role = cleanEnum(body.role, ['super_admin', 'admin', 'editor', 'discipleship_admin'], 'admin');

  if (!username || !email || !fullName || password.length < 8) {
    return NextResponse.json({ success: false, message: 'All fields required; password min 8 chars' }, { status: 400 });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await execute(
      "INSERT INTO admins (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, 'active')",
      [username, email, hash, fullName, role]
    );
    return NextResponse.json({ success: true, id: result.insertId });
  } catch {
    return NextResponse.json({ success: false, message: 'Username or email already exists' }, { status: 409 });
  }
}
