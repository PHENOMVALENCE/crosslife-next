import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTableActions } from '@/components/admin/AdminTableActions';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminSermonsPage() {
  await requireAdmin(CONTENT_ROLES);
  const sermons = await query<RowDataPacket[]>('SELECT * FROM sermons ORDER BY sermon_date DESC, created_at DESC');

  return (
    <>
      <AdminPageHeader title="Sermons Management" actionHref="/admin/sermons/new" actionLabel="Add Sermon" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Speaker</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sermons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted text-center py-4">
                    No sermons yet.
                  </td>
                </tr>
              ) : (
                sermons.map((s) => (
                  <tr key={s.id}>
                    <td>{s.title as string}</td>
                    <td>{s.sermon_type as string}</td>
                    <td>{(s.speaker as string) || '—'}</td>
                    <td>{s.sermon_date ? String(s.sermon_date).slice(0, 10) : '—'}</td>
                    <td>
                      <span className={`badge bg-${s.status === 'published' ? 'success' : 'secondary'}`}>
                        {s.status as string}
                      </span>
                    </td>
                    <td className="text-end">
                      <AdminTableActions editHref={`/admin/sermons/${s.id}`} deleteApiUrl={`/api/admin/sermons/${s.id}`} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
