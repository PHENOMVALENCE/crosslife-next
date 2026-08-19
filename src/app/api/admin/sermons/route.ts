import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM sermons ORDER BY sermon_date DESC, created_at DESC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;

  const body = await request.json();
  const title = cleanString(body.title);
  if (!title) {
    return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
  }

  const sermonType = cleanEnum(body.sermon_type, ['video', 'audio', 'pdf'], 'video');
  const status = cleanEnum(body.status, ['published', 'draft'], 'draft');

  const result = await execute(
    `INSERT INTO sermons (title, description, speaker, sermon_type, youtube_url, audio_url, spotify_url, pdf_url, thumbnail_url, sermon_date, category, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      cleanOptionalString(body.description),
      cleanOptionalString(body.speaker),
      sermonType,
      cleanOptionalString(body.youtube_url),
      cleanOptionalString(body.audio_url),
      cleanOptionalString(body.spotify_url),
      cleanOptionalString(body.pdf_url),
      cleanOptionalString(body.thumbnail_url),
      cleanOptionalString(body.sermon_date),
      cleanOptionalString(body.category),
      status,
    ]
  );

  return NextResponse.json({ success: true, id: result.insertId, message: 'Sermon added successfully' });
}
