import { LeadershipForm } from '@/components/admin/GenericAdminForms';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function EditLeadershipPage({ params }: Params) {
  await requireAdmin(CONTENT_ROLES);
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM leadership WHERE id = ?', [Number(id)]);
  if (!rows[0]) notFound();
  return <LeadershipForm initial={rows[0] as Record<string, unknown>} />;
}
