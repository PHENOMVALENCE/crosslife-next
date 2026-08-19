import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { issueCertificate } from '@/lib/discipleship';
import { sendCourseCompletion } from '@/lib/email/mailer';
import { cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const session = auth;
  const enrollmentId = Number(await params.then((p) => p.id));
  const body = await request.json();
  const certNumber = cleanString(body.certificate_number) || `SOC-${enrollmentId}-${Date.now()}`;
  await issueCertificate(enrollmentId, session.adminId!, certNumber, cleanOptionalString(body.certificate_remarks) || undefined);

  const [row] = await query<RowDataPacket[]>(
    `SELECT e.id, p.program_name, s.email, s.full_name FROM discipleship_enrollments e
     JOIN discipleship_programs p ON p.id = e.program_id JOIN discipleship_students s ON s.id = e.student_id WHERE e.id = ?`,
    [enrollmentId]
  );
  if (row) {
    await sendCourseCompletion(
      { email: row.email as string, full_name: row.full_name as string },
      row.program_name as string,
      enrollmentId
    );
  }
  return NextResponse.json({ success: true, certificate_number: certNumber });
}
