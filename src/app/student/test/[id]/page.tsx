import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import {
  getEnrollment,
  getModule,
  getQuestionsWithOptions,
  hasStudiedModule,
  isModuleUnlocked,
  getModules,
  moduleHasAssessment,
} from '@/lib/discipleship';
import QuizForm from '@/components/student/QuizForm';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };
type SearchParams = { searchParams: Promise<{ enrollment?: string }> };

export default async function StudentTestPage({ params, searchParams }: Params & SearchParams) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) redirect('/student/login');

  const moduleId = Number((await params).id);
  const enrollmentId = Number((await searchParams).enrollment);
  if (!enrollmentId) redirect('/student/dashboard');

  const enrollment = await getEnrollment(enrollmentId, session.studentId!);
  if (!enrollment) redirect('/student/dashboard');

  const module = await getModule(moduleId);
  if (!module) redirect('/student/dashboard');

  const allModules = await getModules(enrollment.program_id);
  const orderedIds = allModules.map((m) => Number(m.id));
  const unlocked = await isModuleUnlocked(enrollmentId, moduleId, orderedIds);
  if (!unlocked) redirect(`/student/program/${enrollmentId}`);

  const studied = await hasStudiedModule(enrollmentId, moduleId);
  const hasQuiz = await moduleHasAssessment(moduleId);
  if (!hasQuiz) redirect(`/student/module/${moduleId}?enrollment=${enrollmentId}`);
  if (!studied) redirect(`/student/module/${moduleId}?enrollment=${enrollmentId}`);

  const questionsRaw = await getQuestionsWithOptions(moduleId);
  const questions = questionsRaw.map((q) => {
    const row = q as RowDataPacket;
    return {
      id: Number(row.id),
      question_text: String(row.question_text),
      options: q.options.map((o) => {
        const opt = o as RowDataPacket;
        return { id: Number(opt.id), option_text: String(opt.option_text) };
      }),
    };
  });

  return (
    <div className="container py-5">
      <Link href={`/student/module/${moduleId}?enrollment=${enrollmentId}`} className="btn btn-link px-0 mb-3">
        ← Back to module
      </Link>
      <h1>Assessment: {module.title as string}</h1>
      <QuizForm
        moduleId={moduleId}
        enrollmentId={enrollmentId}
        questions={questions}
        passMark={Number(module.pass_mark_pct || 70)}
      />
    </div>
  );
}
