import MinistryForm from '@/components/admin/MinistryForm';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function NewMinistryPage() {
  await requireAdmin(CONTENT_ROLES);
  return <MinistryForm />;
}
