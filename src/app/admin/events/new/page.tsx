import EventForm from '@/components/admin/EventForm';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  await requireAdmin(CONTENT_ROLES);
  return <EventForm />;
}
