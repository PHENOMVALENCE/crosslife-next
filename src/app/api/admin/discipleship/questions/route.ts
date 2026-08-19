import { NextRequest, NextResponse } from 'next/server';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { cleanOptionalString, cleanString } from '@/lib/admin/helpers';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const body = await request.json();
  const moduleId = Number(body.module_id);
  const questionText = cleanString(body.question_text);
  if (!moduleId || !questionText) {
    return NextResponse.json({ success: false, message: 'Module and question text required' }, { status: 400 });
  }
  const qResult = await execute(
    'INSERT INTO discipleship_questions (module_id, question_text, display_order) VALUES (?, ?, ?)',
    [moduleId, questionText, Number(body.display_order) || 0]
  );
  const questionId = qResult.insertId;
  const options = Array.isArray(body.options) ? body.options : [];
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    await execute(
      'INSERT INTO discipleship_question_options (question_id, option_text, is_correct, feedback_text, display_order) VALUES (?, ?, ?, ?, ?)',
      [
        questionId,
        cleanString(opt.option_text),
        opt.is_correct ? 1 : 0,
        cleanOptionalString(opt.feedback_text),
        i,
      ]
    );
  }
  return NextResponse.json({ success: true, id: questionId });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi(DISCIPLESHIP_ROLES);
  if (isApiError(auth)) return auth;
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await execute('DELETE FROM discipleship_question_options WHERE question_id = ?', [id]);
  await execute('DELETE FROM discipleship_questions WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
