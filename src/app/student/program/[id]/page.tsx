import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import { getEnrollment, getModules, getPassedModuleIds, isModuleUnlocked } from '@/lib/discipleship';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function StudentProgramPage({ params }: Params) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const enrollmentId = Number((await params).id);
  const enrollment = await getEnrollment(enrollmentId, session.studentId!);
  if (!enrollment) redirect('/student/dashboard');

  const modules = await getModules(enrollment.program_id);
  const orderedIds = modules.map((m) => Number(m.id));
  const passedIds = await getPassedModuleIds(enrollmentId);

  const moduleStates = await Promise.all(
    modules.map(async (m) => {
      const mod = m as RowDataPacket;
      const modId = Number(mod.id);
      return {
        id: modId,
        title: String(mod.title || ''),
        unlocked: await isModuleUnlocked(enrollmentId, modId, orderedIds),
        passed: passedIds.includes(modId),
      };
    })
  );

  return (
    <div className="container py-5">
      <Link href="/student/dashboard" className="btn btn-link px-0 mb-3">← Dashboard</Link>
      <h1>{enrollment.program_name as string}</h1>
      <p className="text-muted">{enrollment.program_description as string}</p>

      {enrollment.status === 'completed' && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>Program completed!</span>
          <Link href={`/student/certificate/${enrollmentId}`} className="btn btn-sm btn-success">
            View Certificate
          </Link>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header"><h5 className="mb-0">Modules</h5></div>
        <ul className="list-group list-group-flush">
          {moduleStates.map((m, index) => (
            <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-secondary me-2">{index + 1}</span>
                {m.title}
                {m.passed && <span className="badge bg-success ms-2">Passed</span>}
                {!m.unlocked && <span className="badge bg-warning text-dark ms-2">Locked</span>}
              </div>
              {m.unlocked ? (
                <Link href={`/student/module/${m.id}?enrollment=${enrollmentId}`} className="btn btn-sm btn-primary">
                  Open
                </Link>
              ) : (
                <span className="text-muted small">Complete previous module</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
