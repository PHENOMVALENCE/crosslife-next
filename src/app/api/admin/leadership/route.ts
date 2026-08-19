import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM leadership ORDER BY display_order ASC, name ASC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(CONTENT_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const name = cleanString(body.name);
  if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  const result = await execute(
    `INSERT INTO leadership (name, role, departments, bio, image_url, email, phone, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      cleanOptionalString(body.role),
      cleanOptionalString(body.departments),
      cleanOptionalString(body.bio),
      cleanOptionalString(body.image_url),
      cleanOptionalString(body.email),
      cleanOptionalString(body.phone),
      cleanEnum(body.status, ['active', 'inactive'], 'active'),
      Number(body.display_order) || 0,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
