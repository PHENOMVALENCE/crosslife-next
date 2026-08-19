import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import { getStudentEnrollments } from '@/lib/discipleship';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { imageUrlForDisplay } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const enrollments = await getStudentEnrollments(session.studentId!);

  let availablePrograms: RowDataPacket[] = [];
  try {
    availablePrograms = await query<RowDataPacket[]>(
      `SELECT p.* FROM discipleship_programs p
       WHERE p.status IN ('active', 'upcoming')
       AND p.id NOT IN (
         SELECT program_id FROM discipleship_enrollments WHERE student_id = ? AND status IN ('active', 'completed')
       )
       ORDER BY p.display_order ASC, p.program_name ASC`,
      [session.studentId!]
    );
  } catch {
    /* ignore */
  }

  const activeEnrollment = enrollments.find((e) => e.status === 'active');
  const continueUrl = activeEnrollment ? `/student/program/${activeEnrollment.id}` : null;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1>School of Christ Academy</h1>
          <p className="lead mb-0">Welcome back, {session.studentName || session.studentEmail}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="btn btn-outline-secondary">Logout</button>
        </form>
      </div>

      {continueUrl && activeEnrollment && (
        <div className="card mb-4 border-primary">
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p className="text-muted small mb-1">Continue learning</p>
              <h5 className="mb-1">{activeEnrollment.program_name as string}</h5>
              <div className="progress" style={{ height: 8, maxWidth: 280 }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${activeEnrollment.modules_total ? Math.round(((activeEnrollment.modules_passed as number) / (activeEnrollment.modules_total as number)) * 100) : 0}%`,
                  }}
                />
              </div>
              <small className="text-muted">
                {activeEnrollment.modules_passed}/{activeEnrollment.modules_total} modules passed
              </small>
            </div>
            <Link href={continueUrl} className="btn btn-primary">Continue</Link>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header"><h5 className="mb-0">My Programs</h5></div>
            <div className="card-body">
              {enrollments.length === 0 ? (
                <p className="text-muted mb-0">You are not enrolled in any program yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {enrollments.map((e) => {
                    const pct = e.modules_total
                      ? Math.round(((e.modules_passed as number) / (e.modules_total as number)) * 100)
                      : 0;
                    return (
                      <li key={e.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <strong>{e.program_name as string}</strong>
                            <div className="small text-muted mb-1">{e.status as string} · {pct}% complete</div>
                            <div className="progress" style={{ height: 6 }}>
                              <div className="progress-bar" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="d-flex flex-column gap-1">
                            <Link href={`/student/program/${e.id}`} className="btn btn-sm btn-primary">Open</Link>
                            {e.status === 'completed' && (
                              <Link href={`/student/certificate/${e.id}`} className="btn btn-sm btn-outline-success">Certificate</Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header"><h5 className="mb-0">Available Programs</h5></div>
            <div className="card-body">
              {availablePrograms.length === 0 ? (
                <p className="text-muted mb-0">No additional programs available right now.</p>
              ) : (
                availablePrograms.map((p) => (
                  <div key={p.id} className="mb-3 pb-3 border-bottom">
                    {p.image_url && (
                      <img src={imageUrlForDisplay(p.image_url as string)} alt="" className="img-fluid rounded mb-2" style={{ maxHeight: 80 }} />
                    )}
                    <strong>{p.program_name as string}</strong>
                    <p className="small text-muted mb-2">{String(p.description || '').slice(0, 120)}</p>
                    <Link href={`/student/programs/${p.id}/enroll`} className="btn btn-sm btn-outline-primary">
                      Enroll
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
