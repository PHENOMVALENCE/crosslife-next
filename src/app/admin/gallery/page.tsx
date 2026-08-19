import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTableActions } from '@/components/admin/AdminTableActions';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  await requireAdmin(CONTENT_ROLES);
  let rows: RowDataPacket[] = [];
  try {
    rows = await query<RowDataPacket[]>('SELECT * FROM gallery_albums ORDER BY display_order ASC, created_at DESC');
  } catch {
    /* table may not exist on older DB */
  }
  return (
    <>
      <AdminPageHeader title="Gallery Albums" actionHref="/admin/gallery/new" actionLabel="Add Album" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.title as string}</td>
                  <td>{r.status as string}</td>
                  <td>{r.display_order as number}</td>
                  <td className="text-end">
                    <AdminTableActions editHref={`/admin/gallery/${r.id}`} deleteApiUrl={`/api/admin/gallery/${r.id}`} />
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
