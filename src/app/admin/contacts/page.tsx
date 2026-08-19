import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusSelect from '@/components/admin/StatusSelect';
import { COMMS_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
  await requireAdmin(COMMS_ROLES);
  const rows = await query<RowDataPacket[]>('SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 200');

  return (
    <>
      <AdminPageHeader title="Contact Inquiries" subtitle="Messages from the public contact form" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{String(r.created_at).slice(0, 10)}</td>
                  <td>{r.name as string}</td>
                  <td>{r.email as string}</td>
                  <td>{r.subject as string}</td>
                  <td style={{ minWidth: 120 }}>
                    <StatusSelect id={r.id as number} apiPath="/api/admin/contacts" value={r.status as string} options={['new', 'read', 'replied', 'archived']} />
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
