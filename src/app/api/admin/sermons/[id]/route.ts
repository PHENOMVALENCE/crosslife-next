import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM sermons WHERE id = ? LIMIT 1', [Number(id)]);
  if (!rows[0]) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const title = cleanString(body.title);
  if (!title) {
    return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
  }

  await execute(
    `UPDATE sermons SET title=?, description=?, speaker=?, sermon_type=?, youtube_url=?, audio_url=?, spotify_url=?, pdf_url=?, thumbnail_url=?, sermon_date=?, category=?, status=? WHERE id=?`,
    [
      title,
      cleanOptionalString(body.description),
      cleanOptionalString(body.speaker),
      cleanEnum(body.sermon_type, ['video', 'audio', 'pdf'], 'video'),
      cleanOptionalString(body.youtube_url),
      cleanOptionalString(body.audio_url),
      cleanOptionalString(body.spotify_url),
      cleanOptionalString(body.pdf_url),
      cleanOptionalString(body.thumbnail_url),
      cleanOptionalString(body.sermon_date),
      cleanOptionalString(body.category),
      cleanEnum(body.status, ['published', 'draft'], 'draft'),
      Number(id),
    ]
  );

  return NextResponse.json({ success: true, message: 'Sermon updated successfully' });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  await execute('DELETE FROM sermons WHERE id = ?', [Number(id)]);
  return NextResponse.json({ success: true, message: 'Sermon deleted' });
}
