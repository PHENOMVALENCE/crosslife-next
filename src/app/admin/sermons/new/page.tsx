import SermonForm from '@/components/admin/SermonForm';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function NewSermonPage() {
  await requireAdmin(CONTENT_ROLES);
  return <SermonForm />;
}
