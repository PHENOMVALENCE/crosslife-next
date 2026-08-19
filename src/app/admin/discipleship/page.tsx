import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DiscipleshipManager from '@/components/admin/DiscipleshipManager';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function AdminDiscipleshipPage() {
  await requireAdmin(DISCIPLESHIP_ROLES);
  return (
    <>
      <AdminPageHeader title="Programs & Modules" subtitle="Manage discipleship programs, modules, resources, quizzes, and certificates" />
      <DiscipleshipManager />
    </>
  );
}
