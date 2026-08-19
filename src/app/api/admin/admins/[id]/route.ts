import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(['super_admin', 'admin']);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute('UPDATE admins SET full_name=?, email=?, role=?, status=? WHERE id=?', [
    cleanString(body.full_name),
    cleanString(body.email),
    cleanEnum(body.role, ['super_admin', 'admin', 'editor', 'discipleship_admin'], 'admin'),
    cleanEnum(body.status, ['active', 'inactive'], 'active'),
    Number(id),
  ]);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(['super_admin']);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const password = String(body.password || '');
  if (password.length < 8) {
    return NextResponse.json({ success: false, message: 'Password min 8 chars' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  await execute('UPDATE admins SET password = ? WHERE id = ?', [hash, Number(id)]);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(['super_admin']);
  if (isApiError(auth)) return auth;
  const id = Number(await params.then((p) => p.id));
  if (id === auth.adminId) {
    return NextResponse.json({ success: false, message: 'Cannot delete your own account' }, { status: 400 });
  }
  const [row] = await query<RowDataPacket[]>('SELECT username FROM admins WHERE id = ?', [id]);
  if (row && ['admin', 'valencedev'].includes(String(row.username).toLowerCase())) {
    return NextResponse.json({ success: false, message: 'Protected account' }, { status: 403 });
  }
  await execute('DELETE FROM admins WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
