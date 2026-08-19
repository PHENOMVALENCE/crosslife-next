import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM gallery_albums ORDER BY display_order ASC, created_at DESC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const title = cleanString(body.title);
  const url = cleanString(body.google_photos_url);
  if (!title || !url) {
    return NextResponse.json({ success: false, message: 'Title and Google Photos URL are required' }, { status: 400 });
  }
  const result = await execute(
    `INSERT INTO gallery_albums (title, description, google_photos_url, cover_image, status, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      cleanOptionalString(body.description),
      url,
      cleanOptionalString(body.cover_image) || 'assets/img/melchezed order.jpeg',
      cleanEnum(body.status, ['active', 'inactive'], 'active'),
      Number(body.display_order) || 0,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
