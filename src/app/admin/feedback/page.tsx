import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusSelect from '@/components/admin/StatusSelect';
import { COMMS_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  await requireAdmin(COMMS_ROLES);
  const rows = await query<RowDataPacket[]>('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200');

  return (
    <>
      <AdminPageHeader title="Feedback" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{String(r.created_at).slice(0, 10)}</td>
                  <td>{(r.feedback_type as string) || '—'}</td>
                  <td>{String(r.message).slice(0, 100)}...</td>
                  <td>
                    <StatusSelect id={r.id as number} apiPath="/api/admin/feedback" value={r.status as string} options={['new', 'read', 'archived']} />
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
