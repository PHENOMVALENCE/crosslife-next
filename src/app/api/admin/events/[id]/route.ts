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
  const rows = await query<RowDataPacket[]>('SELECT * FROM events WHERE id = ?', [Number(id)]);
  if (!rows[0]) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute(
    `UPDATE events SET title=?, description=?, event_date=?, event_time=?, end_date=?, end_time=?, location=?, event_type=?, image_url=?, status=? WHERE id=?`,
    [
      cleanString(body.title),
      cleanOptionalString(body.description),
      cleanString(body.event_date),
      cleanOptionalString(body.event_time),
      cleanOptionalString(body.end_date),
      cleanOptionalString(body.end_time),
      cleanOptionalString(body.location),
      cleanOptionalString(body.event_type),
      cleanOptionalString(body.image_url),
      cleanEnum(body.status, ['upcoming', 'ongoing', 'completed', 'cancelled'], 'upcoming'),
      Number(id),
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  await execute('DELETE FROM events WHERE id = ?', [Number(id)]);
  return NextResponse.json({ success: true });
}
