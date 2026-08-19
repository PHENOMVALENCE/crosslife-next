import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM leadership WHERE id = ?', [Number(id)]);
  if (!rows[0]) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute(
    `UPDATE leadership SET name=?, role=?, departments=?, bio=?, image_url=?, email=?, phone=?, status=?, display_order=? WHERE id=?`,
    [
      cleanString(body.name),
      cleanOptionalString(body.role),
      cleanOptionalString(body.departments),
      cleanOptionalString(body.bio),
      cleanOptionalString(body.image_url),
      cleanOptionalString(body.email),
      cleanOptionalString(body.phone),
      cleanEnum(body.status, ['active', 'inactive'], 'active'),
      Number(body.display_order) || 0,
      Number(id),
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  await execute('DELETE FROM leadership WHERE id = ?', [Number(id)]);
  return NextResponse.json({ success: true });
}
