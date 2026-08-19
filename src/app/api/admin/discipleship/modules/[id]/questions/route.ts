import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { getQuestionsWithOptions } from '@/lib/discipleship';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const moduleId = Number(await params.then((p) => p.id));
  const data = await getQuestionsWithOptions(moduleId);
  return NextResponse.json({ success: true, data });
}
