import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const moduleId = Number(body.module_id);
  const resourceType = cleanEnum(body.resource_type, ['text', 'audio', 'video', 'pdf'], 'text');
  if (!moduleId) {
    return NextResponse.json({ success: false, message: 'module_id required' }, { status: 400 });
  }
  const result = await execute(
    `INSERT INTO discipleship_module_resources (module_id, resource_type, title, content, file_path, display_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      moduleId,
      resourceType,
      cleanOptionalString(body.title),
      resourceType === 'text' ? cleanOptionalString(body.content) : null,
      resourceType !== 'text' ? cleanOptionalString(body.file_path) : null,
      Number(body.display_order) || 0,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
