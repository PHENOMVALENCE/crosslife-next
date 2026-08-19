import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function EnrollProgramPage({ params }: Params) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const { id } = await params;
  const programId = Number(id);
  const programs = await query<RowDataPacket[]>('SELECT * FROM discipleship_programs WHERE id = ? LIMIT 1', [programId]);
  const program = programs[0];
  if (!program) redirect('/student/dashboard');

  const existing = await query<RowDataPacket[]>(
    'SELECT id FROM discipleship_enrollments WHERE student_id = ? AND program_id = ? LIMIT 1',
    [session.studentId!, programId]
  );
  if (existing.length === 0) {
    await execute(
      "INSERT INTO discipleship_enrollments (student_id, program_id, status, enrolled_at) VALUES (?, ?, 'active', NOW())",
      [session.studentId!, programId]
    );
  }

  const enrollment = await query<RowDataPacket[]>(
    'SELECT id FROM discipleship_enrollments WHERE student_id = ? AND program_id = ? LIMIT 1',
    [session.studentId!, programId]
  );

  redirect(`/student/program/${enrollment[0]?.id || ''}`);
}
