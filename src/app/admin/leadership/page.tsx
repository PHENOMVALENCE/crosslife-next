import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTableActions } from '@/components/admin/AdminTableActions';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminLeadershipPage() {
  await requireAdmin(CONTENT_ROLES);
  const rows = await query<RowDataPacket[]>('SELECT * FROM leadership ORDER BY display_order ASC, name ASC');
  return (
    <>
      <AdminPageHeader title="Leadership Management" actionHref="/admin/leadership/new" actionLabel="Add Leader" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name as string}</td>
                  <td>{(r.role as string) || '—'}</td>
                  <td>{r.status as string}</td>
                  <td className="text-end">
                    <AdminTableActions editHref={`/admin/leadership/${r.id}`} deleteApiUrl={`/api/admin/leadership/${r.id}`} />
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
