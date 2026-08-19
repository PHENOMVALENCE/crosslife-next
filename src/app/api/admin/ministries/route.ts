import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM ministries ORDER BY display_order ASC, name ASC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const name = cleanString(body.name);
  if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  const result = await execute(
    `INSERT INTO ministries (name, description, image_url, leader_name, contact_email, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      cleanString(body.description),
      cleanOptionalString(body.image_url),
      cleanOptionalString(body.leader_name),
      cleanOptionalString(body.contact_email),
      cleanEnum(body.status, ['active', 'inactive'], 'active'),
      Number(body.display_order) || 0,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
