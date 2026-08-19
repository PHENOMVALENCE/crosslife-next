import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { sendAccountApproved } from '@/lib/email/mailer';
import { cleanEnum } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const status = cleanEnum(body.status, ['pending', 'active', 'inactive'], 'pending');

  const [before] = await query<RowDataPacket[]>(
    'SELECT email, full_name, status FROM discipleship_students WHERE id = ?',
    [Number(id)]
  );

  await execute(`UPDATE discipleship_students SET status = ? WHERE id = ?`, [status, Number(id)]);

  if (before && before.status !== 'active' && status === 'active') {
    await sendAccountApproved({ email: before.email as string, full_name: before.full_name as string });
  }

  return NextResponse.json({ success: true });
}
