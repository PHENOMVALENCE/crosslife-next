import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { isStudentLoggedIn } from '@/lib/auth/session';
import { getEnrollment, isModuleUnlocked, markModuleStudied, getModules } from '@/lib/discipleship';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!isStudentLoggedIn(session)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId, moduleId } = await request.json();
  const enrollment = await getEnrollment(Number(enrollmentId), session.studentId!);
  if (!enrollment) {
    return NextResponse.json({ success: false, message: 'Enrollment not found' }, { status: 404 });
  }

  const modules = await getModules(enrollment.program_id);
  const orderedIds = modules.map((m) => Number(m.id));
  const unlocked = await isModuleUnlocked(Number(enrollmentId), Number(moduleId), orderedIds);
  if (!unlocked) {
    return NextResponse.json({ success: false, message: 'Complete the previous module first.' }, { status: 403 });
  }

  await markModuleStudied(Number(enrollmentId), Number(moduleId));
  return NextResponse.json({ success: true });
}
