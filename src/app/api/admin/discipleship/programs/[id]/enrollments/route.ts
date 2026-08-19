import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const programId = Number(await params.then((p) => p.id));
  const rows = await query<RowDataPacket[]>(
    `SELECT e.id, e.status, e.completed_at, e.certificate_issued, e.certificate_number,
            s.full_name, s.email
     FROM discipleship_enrollments e
     JOIN discipleship_students s ON s.id = e.student_id
     WHERE e.program_id = ?
     ORDER BY e.enrolled_at DESC`,
    [programId]
  );
  return NextResponse.json({ success: true, data: rows });
}
