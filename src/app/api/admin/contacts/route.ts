import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { COMMS_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const auth = await requireAdminApi(COMMS_ROLES);
  if (isApiError(auth)) return auth;
  const rows = await query<RowDataPacket[]>('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
  return NextResponse.json({ success: true, data: rows });
}
