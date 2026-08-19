import { RowDataPacket } from 'mysql2';
import { execute, query } from './db';

export type Enrollment = RowDataPacket & {
  id: number;
  student_id: number;
  program_id: number;
  status: string;
  program_name?: string;
  certificate_issued?: number;
  certificate_number?: string;
  certificate_issued_at?: string;
  completed_at?: string;
};

export async function getProgram(programId: number) {
  const rows = await query<RowDataPacket[]>('SELECT * FROM discipleship_programs WHERE id = ? LIMIT 1', [programId]);
  return rows[0] || null;
}

export async function getModules(programId: number) {
  return query<RowDataPacket[]>(
    'SELECT * FROM discipleship_modules WHERE program_id = ? ORDER BY display_order ASC, id ASC',
    [programId]
  );
}

export async function getModule(moduleId: number) {
  const rows = await query<RowDataPacket[]>('SELECT * FROM discipleship_modules WHERE id = ? LIMIT 1', [moduleId]);
  return rows[0] || null;
}

export async function getResources(moduleId: number) {
  return query<RowDataPacket[]>(
    'SELECT * FROM discipleship_module_resources WHERE module_id = ? ORDER BY display_order ASC, id ASC',
    [moduleId]
  );
}

export async function getEnrollment(enrollmentId: number, studentId?: number) {
  let sql = `SELECT e.*, p.program_name, p.description AS program_description, p.image_url
    FROM discipleship_enrollments e JOIN discipleship_programs p ON p.id = e.program_id WHERE e.id = ?`;
  const params: number[] = [enrollmentId];
  if (studentId) {
    sql += ' AND e.student_id = ?';
    params.push(studentId);
  }
  const rows = await query<RowDataPacket[]>(sql + ' LIMIT 1', params);
  return rows[0] || null;
}

export async function getStudentEnrollments(studentId: number) {
  const rows = await query<RowDataPacket[]>(
    `SELECT e.*, p.program_name, p.description, p.duration, p.image_url
     FROM discipleship_enrollments e JOIN discipleship_programs p ON p.id = e.program_id
     WHERE e.student_id = ? ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
  for (const row of rows) {
    const [total] = await query<RowDataPacket[]>(
      'SELECT COUNT(*) AS c FROM discipleship_modules WHERE program_id = ?',
      [row.program_id]
    );
    const [passed] = await query<RowDataPacket[]>(
      'SELECT COUNT(*) AS c FROM discipleship_module_progress WHERE enrollment_id = ? AND passed_at IS NOT NULL',
      [row.id]
    );
    row.modules_total = Number(total?.c || 0);
    row.modules_passed = Number(passed?.c || 0);
  }
  return rows;
}

export async function getPassedModuleIds(enrollmentId: number): Promise<number[]> {
  const rows = await query<RowDataPacket[]>(
    'SELECT module_id FROM discipleship_module_progress WHERE enrollment_id = ? AND passed_at IS NOT NULL ORDER BY module_id ASC',
    [enrollmentId]
  );
  return rows.map((r) => Number(r.module_id));
}

export async function isModuleUnlocked(enrollmentId: number, moduleId: number, orderedModuleIds: number[]) {
  const passed = await getPassedModuleIds(enrollmentId);
  const index = orderedModuleIds.indexOf(moduleId);
  if (index === -1) return false;
  if (index === 0) return true;
  return passed.includes(orderedModuleIds[index - 1]);
}

export async function hasStudiedModule(enrollmentId: number, moduleId: number) {
  const rows = await query<RowDataPacket[]>(
    'SELECT 1 AS ok FROM discipleship_module_progress WHERE enrollment_id = ? AND module_id = ? AND studied_at IS NOT NULL LIMIT 1',
    [enrollmentId, moduleId]
  );
  return rows.length > 0;
}

export async function markModuleStudied(enrollmentId: number, moduleId: number) {
  await execute(
    `INSERT INTO discipleship_module_progress (enrollment_id, module_id, studied_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE studied_at = COALESCE(studied_at, NOW())`,
    [enrollmentId, moduleId]
  );
}

export async function moduleHasAssessment(moduleId: number) {
  const [row] = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM discipleship_questions WHERE module_id = ?',
    [moduleId]
  );
  return Number(row?.c || 0) > 0;
}

export async function getQuestionsWithOptions(moduleId: number) {
  const questions = await query<RowDataPacket[]>(
    'SELECT * FROM discipleship_questions WHERE module_id = ? ORDER BY display_order ASC, id ASC',
    [moduleId]
  );
  return Promise.all(
    questions.map(async (q) => {
      const options = await query<RowDataPacket[]>(
        'SELECT * FROM discipleship_question_options WHERE question_id = ? ORDER BY display_order ASC, id ASC',
        [q.id]
      );
      return { ...q, options };
    })
  );
}

export async function recordAttempt(
  enrollmentId: number,
  moduleId: number,
  scorePct: number,
  passed: boolean,
  answers: Array<{ question_id: number; option_id: number; is_correct: boolean }>
) {
  const result = await execute(
    'INSERT INTO discipleship_module_attempts (enrollment_id, module_id, score_pct, passed, attempted_at) VALUES (?, ?, ?, ?, NOW())',
    [enrollmentId, moduleId, scorePct, passed ? 1 : 0]
  );
  const attemptId = result.insertId;
  for (const a of answers) {
    await execute(
      'INSERT INTO discipleship_attempt_answers (attempt_id, question_id, option_id, is_correct) VALUES (?, ?, ?, ?)',
      [attemptId, a.question_id, a.option_id, a.is_correct ? 1 : 0]
    );
  }
  if (passed) {
    await execute(
      `INSERT INTO discipleship_module_progress (enrollment_id, module_id, passed_at)
       VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE passed_at = NOW()`,
      [enrollmentId, moduleId]
    );
    await checkAndSetProgramCompleted(enrollmentId);
  }
  return attemptId;
}

export async function checkAndSetProgramCompleted(enrollmentId: number) {
  const enrollment = await getEnrollment(enrollmentId);
  if (!enrollment || enrollment.status !== 'active') return null;

  const [totalRow] = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM discipleship_modules WHERE program_id = ?',
    [enrollment.program_id]
  );
  const [passedRow] = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM discipleship_module_progress WHERE enrollment_id = ? AND passed_at IS NOT NULL',
    [enrollmentId]
  );
  const total = Number(totalRow?.c || 0);
  const passed = Number(passedRow?.c || 0);
  if (total > 0 && passed >= total) {
    await execute(
      "UPDATE discipleship_enrollments SET status = 'completed', completed_at = NOW() WHERE id = ?",
      [enrollmentId]
    );
    const [student] = await query<RowDataPacket[]>(
      'SELECT id, email, full_name FROM discipleship_students WHERE id = ?',
      [enrollment.student_id]
    );
    return { student, program_name: enrollment.program_name, enrollment_id: enrollmentId };
  }
  return null;
}

export async function issueCertificate(
  enrollmentId: number,
  adminId: number,
  certificateNumber: string,
  remarks?: string
) {
  await execute(
    `UPDATE discipleship_enrollments SET certificate_issued = 1, certificate_issued_at = NOW(),
     certificate_issued_by = ?, certificate_number = ?, certificate_remarks = ? WHERE id = ?`,
    [adminId, certificateNumber, remarks || null, enrollmentId]
  );
}

export function resourceUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  const clean = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return clean.startsWith('http') ? clean : `/${clean}`;
}
