import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { requireAdmin } from '@/lib/auth/require-admin';
import { isSuperAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await requireAdmin(['super_admin']);
  return (
    <>
      <AdminPageHeader title="Settings" subtitle="Admin account management" />
      <AdminSettingsClient isSuperAdmin={isSuperAdmin(session)} />
    </>
  );
}
