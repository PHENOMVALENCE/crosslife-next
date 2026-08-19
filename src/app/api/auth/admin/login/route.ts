import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/auth/get-session';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Please enter both username and password.' });
    }

    const admins = await query<RowDataPacket[]>(
      'SELECT id, username, password, full_name, role, status FROM admins WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );
    const admin = admins[0];
    if (!admin || !(await bcrypt.compare(password, admin.password as string))) {
      return NextResponse.json({ success: false, message: 'Invalid username or password.' });
    }
    if (admin.status !== 'active') {
      return NextResponse.json({ success: false, message: 'Your account has been deactivated.' });
    }

    const session = await getSession();
    session.adminId = admin.id as number;
    session.adminUsername = admin.username as string;
    session.adminName = admin.full_name as string;
    session.adminRole = admin.role as string;
    session.lastActivity = Date.now();
    await session.save();

    await execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    const redirect =
      admin.role === 'discipleship_admin' ? '/admin/discipleship' : '/admin';

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, message: 'Login failed.' }, { status: 500 });
  }
}
