import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTableActions } from '@/components/admin/AdminTableActions';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminMinistriesPage() {
  await requireAdmin(CONTENT_ROLES);
  const rows = await query<RowDataPacket[]>('SELECT * FROM ministries ORDER BY display_order ASC, name ASC');

  return (
    <>
      <AdminPageHeader title="Ministries Management" actionHref="/admin/ministries/new" actionLabel="Add Ministry" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Leader</th>
                <th>Status</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.name as string}</td>
                  <td>{(m.leader_name as string) || '—'}</td>
                  <td>{m.status as string}</td>
                  <td>{m.display_order as number}</td>
                  <td className="text-end">
                    <AdminTableActions editHref={`/admin/ministries/${m.id}`} deleteApiUrl={`/api/admin/ministries/${m.id}`} />
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
