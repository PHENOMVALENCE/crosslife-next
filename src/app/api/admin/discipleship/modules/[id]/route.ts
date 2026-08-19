import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM discipleship_modules WHERE id = ?', [Number(id)]);
  if (!rows[0]) return NextResponse.json({ success: false }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const passMark = Math.max(0, Math.min(100, Number(body.pass_mark_pct) || 70));
  await execute(
    'UPDATE discipleship_modules SET title=?, description=?, display_order=?, pass_mark_pct=? WHERE id=?',
    [
      cleanString(body.title),
      cleanOptionalString(body.description),
      Number(body.display_order) || 0,
      passMark,
      Number(id),
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const [mod] = await query<RowDataPacket[]>('SELECT program_id FROM discipleship_modules WHERE id = ?', [Number(id)]);
  await execute('DELETE FROM discipleship_modules WHERE id = ?', [Number(id)]);
  return NextResponse.json({ success: true, program_id: mod?.program_id });
}
