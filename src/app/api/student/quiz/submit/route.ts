import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import {
  checkAndSetProgramCompleted,
  getEnrollment,
  getModules,
  getQuestionsWithOptions,
  hasStudiedModule,
  isModuleUnlocked,
  moduleHasAssessment,
  recordAttempt,
} from '@/lib/discipleship';
import { sendCourseCompletion } from '@/lib/email/mailer';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { moduleId, enrollmentId, answers } = await request.json();
  const eid = Number(enrollmentId);
  const mid = Number(moduleId);

  const enrollment = await getEnrollment(eid, session.studentId!);
  if (!enrollment) {
    return NextResponse.json({ success: false, message: 'Enrollment not found' }, { status: 404 });
  }

  const modules = await getModules(enrollment.program_id);
  const orderedIds = modules.map((m) => Number(m.id));
  const unlocked = await isModuleUnlocked(eid, mid, orderedIds);
  if (!unlocked) {
    return NextResponse.json({ success: false, message: 'Module is locked.' }, { status: 403 });
  }

  const studied = await hasStudiedModule(eid, mid);
  if (!studied) {
    return NextResponse.json({ success: false, message: 'Mark the module as studied before taking the assessment.' }, { status: 403 });
  }

  const questions = await getQuestionsWithOptions(mid);
  if (questions.length === 0) {
    return NextResponse.json({ success: false, message: 'No questions configured.' }, { status: 400 });
  }

  let correct = 0;
  const answerRecords: Array<{ question_id: number; option_id: number; is_correct: boolean }> = [];

  for (const q of questions) {
    const qRow = q as RowDataPacket;
    const selectedId = Number(answers[`q_${qRow.id}`]);
    if (!selectedId) continue;
    const opt = q.options.find((o) => Number((o as RowDataPacket).id) === selectedId);
    const isCorrect = Boolean((opt as RowDataPacket | undefined)?.is_correct);
    if (isCorrect) correct++;
    answerRecords.push({ question_id: Number(qRow.id), option_id: selectedId, is_correct: isCorrect });
  }

  const scorePct = Math.round((correct / questions.length) * 100);
  const mod = modules.find((m) => Number(m.id) === mid);
  const passMark = Number(mod?.pass_mark_pct || 70);
  const passed = scorePct >= passMark;

  const attemptId = await recordAttempt(eid, mid, scorePct, passed, answerRecords);

  if (passed) {
    const completion = await checkAndSetProgramCompleted(eid);
    if (completion?.student) {
      await sendCourseCompletion(
        { email: completion.student.email as string, full_name: completion.student.full_name as string },
        completion.program_name as string,
        eid
      );
    }
  }

  return NextResponse.json({ success: true, scorePct, passed, attemptId });
}
