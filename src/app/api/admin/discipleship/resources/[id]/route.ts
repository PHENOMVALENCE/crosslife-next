import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum, cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const resourceType = cleanEnum(body.resource_type, ['text', 'audio', 'video', 'pdf'], 'text');
  await execute(
    `UPDATE discipleship_module_resources SET resource_type=?, title=?, content=?, file_path=?, display_order=? WHERE id=?`,
    [
      resourceType,
      cleanOptionalString(body.title),
      resourceType === 'text' ? cleanOptionalString(body.content) : null,
      resourceType !== 'text' ? cleanOptionalString(body.file_path) : null,
      Number(body.display_order) || 0,
      Number(await params.then((p) => p.id)),
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  await execute('DELETE FROM discipleship_module_resources WHERE id = ?', [Number(await params.then((p) => p.id))]);
  return NextResponse.json({ success: true });
}
