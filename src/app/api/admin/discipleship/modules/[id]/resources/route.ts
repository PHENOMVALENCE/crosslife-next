import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const moduleId = Number(await params.then((p) => p.id));
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM discipleship_module_resources WHERE module_id = ? ORDER BY display_order ASC, id ASC',
    [moduleId]
  );
  return NextResponse.json({ success: true, data: rows });
}
