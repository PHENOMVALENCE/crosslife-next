import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const programId = Number(body.program_id);
  const title = cleanString(body.title);
  if (!programId || !title) {
    return NextResponse.json({ success: false, message: 'Program and title required' }, { status: 400 });
  }
  let order = Number(body.display_order) || 0;
  if (order <= 0) {
    const [max] = await query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM discipleship_modules WHERE program_id = ?',
      [programId]
    );
    order = Number(max?.n || 1);
  }
  const passMark = Math.max(0, Math.min(100, Number(body.pass_mark_pct) || 70));
  const result = await execute(
    'INSERT INTO discipleship_modules (program_id, title, description, display_order, pass_mark_pct) VALUES (?, ?, ?, ?, ?)',
    [programId, title, cleanOptionalString(body.description), order, passMark]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
