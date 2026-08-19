import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTableActions } from '@/components/admin/AdminTableActions';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  await requireAdmin(CONTENT_ROLES);
  const events = await query<RowDataPacket[]>('SELECT * FROM events ORDER BY event_date DESC');

  return (
    <>
      <AdminPageHeader title="Events Management" actionHref="/admin/events/new" actionLabel="Add Event" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.title as string}</td>
                  <td>{String(e.event_date).slice(0, 10)}</td>
                  <td>{(e.location as string) || '—'}</td>
                  <td>{e.status as string}</td>
                  <td className="text-end">
                    <AdminTableActions editHref={`/admin/events/${e.id}`} deleteApiUrl={`/api/admin/events/${e.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
