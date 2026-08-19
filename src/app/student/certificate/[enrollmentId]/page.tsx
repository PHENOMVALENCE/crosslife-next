import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import { getEnrollment, getModules } from '@/lib/discipleship';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ enrollmentId: string }> };

export default async function StudentCertificatePage({ params }: Params) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const enrollmentId = Number((await params).enrollmentId);
  const enrollment = await getEnrollment(enrollmentId, session.studentId!);
  if (!enrollment) redirect('/student/dashboard');

  if (enrollment.status !== 'completed') {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <h4>Certificate not yet available</h4>
          <p>Complete all modules in this program to unlock your certificate.</p>
          <Link href={`/student/program/${enrollmentId}`} className="btn btn-primary">Continue program</Link>
        </div>
      </div>
    );
  }

  const certRows = await query<RowDataPacket[]>(
    `SELECT e.*, a.full_name AS issued_by_name FROM discipleship_enrollments e
     LEFT JOIN admins a ON a.id = e.certificate_issued_by WHERE e.id = ?`,
    [enrollmentId]
  );
  const cert = certRows[0];
  const modules = await getModules(enrollment.program_id);

  const issued = Boolean(cert?.certificate_issued);

  return (
    <div className="container py-5">
      <Link href={`/student/program/${enrollmentId}`} className="btn btn-link px-0 mb-3">← Back to program</Link>

      {!issued ? (
        <>
          <div className="text-center mb-4">
            <h1><i className="bi bi-trophy-fill text-warning me-2"></i>Congratulations!</h1>
            <p className="lead">You completed <strong>{enrollment.program_name as string}</strong>.</p>
          </div>
          <div className="card mb-4">
            <div className="card-body text-center">
              <p className="text-muted">All {modules.length} modules completed. Your certificate will appear here once an administrator issues it.</p>
              {enrollment.completed_at && (
                <p className="small text-muted">Completed on {String(enrollment.completed_at).slice(0, 10)}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-4">
            <h1><i className="bi bi-award-fill text-warning me-2"></i>Certificate of Completion</h1>
            <p className="lead">{enrollment.program_name as string}</p>
          </div>
          <div className="card border-warning mb-4" id="certificate-card">
            <div className="card-body text-center p-5">
              <img src="/assets/img/logo.png" alt="CrossLife" style={{ height: 64 }} className="mb-4" />
              <p className="text-uppercase text-muted mb-1">School of Christ Academy</p>
              <h2 className="mb-3">Certificate of Completion</h2>
              <p>This certifies that</p>
              <h3 className="mb-3">{session.studentName}</h3>
              <p>has successfully completed</p>
              <h4 className="mb-4">{enrollment.program_name as string}</h4>
              <p className="small text-muted">
                Certificate No: {cert.certificate_number as string}
                {cert.certificate_issued_at && <> · Issued {String(cert.certificate_issued_at).slice(0, 10)}</>}
                {cert.issued_by_name && <> · {cert.issued_by_name as string}</>}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="d-flex gap-2">
        <Link href="/student/dashboard" className="btn btn-outline-secondary">Dashboard</Link>
        <Link href={`/student/program/${enrollmentId}`} className="btn btn-primary">View program</Link>
      </div>
    </div>
  );
}
