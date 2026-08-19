import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM discipleship_programs ORDER BY display_order ASC, program_name ASC'
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const name = cleanString(body.program_name);
  if (!name || !cleanString(body.description)) {
    return NextResponse.json({ success: false, message: 'Name and description required' }, { status: 400 });
  }
  const result = await execute(
    `INSERT INTO discipleship_programs (program_name, description, features, image_url, duration, requirements, status, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      cleanString(body.description),
      cleanOptionalString(body.features),
      cleanOptionalString(body.image_url),
      cleanOptionalString(body.duration),
      cleanOptionalString(body.requirements),
      cleanEnum(body.status, ['active', 'inactive', 'upcoming'], 'active'),
      Number(body.display_order) || 0,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
