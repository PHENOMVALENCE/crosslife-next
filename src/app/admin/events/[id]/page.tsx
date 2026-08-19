import EventForm from '@/components/admin/EventForm';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Params) {
  await requireAdmin(CONTENT_ROLES);
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM events WHERE id = ?', [Number(id)]);
  if (!rows[0]) notFound();
  const e = rows[0];
  return (
    <EventForm
      initial={{
        id: e.id as number,
        title: e.title as string,
        description: (e.description as string) || '',
        event_date: String(e.event_date),
        event_time: (e.event_time as string) || '',
        end_date: e.end_date ? String(e.end_date) : '',
        end_time: (e.end_time as string) || '',
        location: (e.location as string) || '',
        event_type: (e.event_type as string) || '',
        image_url: (e.image_url as string) || '',
        status: e.status as string,
      }}
    />
  );
}
