import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import {
  getEnrollment,
  getModule,
  getResources,
  hasStudiedModule,
  isModuleUnlocked,
  getModules,
  moduleHasAssessment,
  resourceUrl,
} from '@/lib/discipleship';
import MarkStudiedButton from '@/components/student/MarkStudiedButton';
import { imageUrlForDisplay } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };
type SearchParams = { searchParams: Promise<{ enrollment?: string }> };

export default async function StudentModulePage({ params, searchParams }: Params & SearchParams) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const moduleId = Number((await params).id);
  const enrollmentId = Number((await searchParams).enrollment);
  if (!enrollmentId) redirect('/student/dashboard');

  const enrollment = await getEnrollment(enrollmentId, session.studentId!);
  if (!enrollment) redirect('/student/dashboard');

  const module = await getModule(moduleId);
  if (!module || module.program_id !== enrollment.program_id) redirect('/student/dashboard');

  const allModules = await getModules(enrollment.program_id);
  const orderedIds = allModules.map((m) => Number(m.id));
  const unlocked = await isModuleUnlocked(enrollmentId, moduleId, orderedIds);
  if (!unlocked) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Module locked</h4>
          <p>Complete and pass the previous module before opening this one.</p>
          <Link href={`/student/program/${enrollmentId}`} className="btn btn-primary">Back to program</Link>
        </div>
      </div>
    );
  }

  const resources = await getResources(moduleId);
  const studied = await hasStudiedModule(enrollmentId, moduleId);
  const hasQuiz = await moduleHasAssessment(moduleId);

  return (
    <div className="container py-5">
      <Link href={`/student/program/${enrollmentId}`} className="btn btn-link px-0 mb-3">← Back to program</Link>
      <h1>{module.title as string}</h1>
      <p className="text-muted">{enrollment.program_name as string}</p>
      {module.description && <p>{module.description as string}</p>}

      {resources.map((r) => (
        <div key={r.id} className="card mb-3">
          <div className="card-body">
            <h5>{(r.title as string) || (r.resource_type as string)}</h5>
            {r.resource_type === 'text' && (
              <div dangerouslySetInnerHTML={{ __html: String(r.content || '') }} />
            )}
            {r.resource_type === 'pdf' && r.file_path && (
              <a href={imageUrlForDisplay(resourceUrl(r.file_path as string))} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Open PDF
              </a>
            )}
            {r.resource_type === 'video' && r.file_path && (
              <video controls className="w-100" src={imageUrlForDisplay(resourceUrl(r.file_path as string))} />
            )}
            {r.resource_type === 'audio' && r.file_path && (
              <audio controls className="w-100" src={imageUrlForDisplay(resourceUrl(r.file_path as string))} />
            )}
          </div>
        </div>
      ))}

      {resources.length === 0 && <p className="text-muted">No study materials yet for this module.</p>}

      {hasQuiz && (
        <>
          <MarkStudiedButton enrollmentId={enrollmentId} moduleId={moduleId} studied={studied} />
          {studied && (
            <Link href={`/student/test/${moduleId}?enrollment=${enrollmentId}`} className="btn btn-success">
              Take Assessment
            </Link>
          )}
        </>
      )}
    </div>
  );
}
