import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/auth/get-session';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please enter email and password.' });
    }

    const students = await query<RowDataPacket[]>(
      'SELECT id, email, password_hash, full_name, status FROM discipleship_students WHERE email = ? LIMIT 1',
      [email]
    );
    const student = students[0];
    if (!student) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordOk =
      student.password_hash &&
      (await bcrypt.compare(password, student.password_hash as string));

    if (!passwordOk) {
      if (student.status === 'pending') {
        return NextResponse.json({
          success: false,
          message:
            'Your account is pending approval. An admin will review your registration and notify you when you can log in.',
        });
      }
      return NextResponse.json({ success: false, message: 'Invalid email or password.' });
    }

    if (student.status === 'pending') {
      return NextResponse.json({
        success: false,
        message:
          'Your account is pending approval. An admin will review your registration and notify you when you can log in.',
      });
    }

    if (student.status !== 'active') {
      return NextResponse.json({ success: false, message: 'Your account has been deactivated.' });
    }

    const session = await getSession();
    session.studentId = student.id as number;
    session.studentEmail = student.email as string;
    session.studentName = student.full_name as string;
    session.studentStatus = student.status as string;
    session.lastActivity = Date.now();
    await session.save();

    await execute('UPDATE discipleship_students SET last_login = NOW() WHERE id = ?', [student.id]);

    return NextResponse.json({ success: true, redirect: '/student/dashboard' });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ success: false, message: 'Login failed.' }, { status: 500 });
  }
}
