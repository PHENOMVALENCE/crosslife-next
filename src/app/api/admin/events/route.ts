import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM events ORDER BY event_date DESC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const title = cleanString(body.title);
  const eventDate = cleanString(body.event_date);
  if (!title || !eventDate) {
    return NextResponse.json({ success: false, message: 'Title and event date are required' }, { status: 400 });
  }

  const result = await execute(
    `INSERT INTO events (title, description, event_date, event_time, end_date, end_time, location, event_type, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      cleanOptionalString(body.description),
      eventDate,
      cleanOptionalString(body.event_time),
      cleanOptionalString(body.end_date),
      cleanOptionalString(body.end_time),
      cleanOptionalString(body.location),
      cleanOptionalString(body.event_type),
      cleanOptionalString(body.image_url),
      cleanEnum(body.status, ['upcoming', 'ongoing', 'completed', 'cancelled'], 'upcoming'),
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
