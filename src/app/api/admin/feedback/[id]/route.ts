import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { COMMS_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanEnum } from '@/lib/admin/helpers';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(COMMS_ROLES);
  if (isApiError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  await execute(`UPDATE feedback SET status = ? WHERE id = ?`, [
    cleanEnum(body.status, ['new', 'read', 'archived'], 'read'),
    Number(id),
  ]);
  return NextResponse.json({ success: true });
}
