import { LeadershipForm } from '@/components/admin/GenericAdminForms';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function NewLeadershipPage() {
  await requireAdmin(CONTENT_ROLES);
  return <LeadershipForm />;
}
