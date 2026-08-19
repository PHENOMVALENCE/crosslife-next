import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM discipleship_programs WHERE id = ?', [Number(id)]);
  if (!rows[0]) return NextResponse.json({ success: false }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute(
    `UPDATE discipleship_programs SET program_name=?, description=?, features=?, image_url=?, duration=?, requirements=?, status=?, display_order=? WHERE id=?`,
    [
      cleanString(body.program_name),
      cleanString(body.description),
      cleanOptionalString(body.features),
      cleanOptionalString(body.image_url),
      cleanOptionalString(body.duration),
      cleanOptionalString(body.requirements),
      cleanEnum(body.status, ['active', 'inactive', 'upcoming'], 'active'),
      Number(body.display_order) || 0,
      Number(id),
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  await execute('DELETE FROM discipleship_programs WHERE id = ?', [Number(await params.then((p) => p.id))]);
  return NextResponse.json({ success: true });
}
