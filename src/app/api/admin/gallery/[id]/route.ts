import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute(
    `UPDATE gallery_albums SET title=?, description=?, google_photos_url=?, cover_image=?, status=?, display_order=? WHERE id=?`,
    [
      cleanString(body.title),
      cleanOptionalString(body.description),
      cleanString(body.google_photos_url),
      cleanOptionalString(body.cover_image),
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
  await execute('DELETE FROM gallery_albums WHERE id = ?', [Number(id)]);
  return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM gallery_albums WHERE id = ?', [Number(id)]);
  if (!rows[0]) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}
