import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { COMMS_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  await requireAdmin(COMMS_ROLES);
  const rows = await query<RowDataPacket[]>('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC LIMIT 500');

  return (
    <>
      <AdminPageHeader title="Newsletter Subscribers" subtitle={`${rows.length} subscribers shown`} />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email as string}</td>
                  <td>{r.status as string}</td>
                  <td>{String(r.subscribed_at).slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
