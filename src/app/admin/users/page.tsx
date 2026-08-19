import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Link from 'next/link';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireAdmin(CONTENT_ROLES);
  const admins = await query<RowDataPacket[]>(
    'SELECT id, username, email, full_name, role, status FROM admins ORDER BY full_name ASC'
  );
  const studentCount = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM discipleship_students'
  );

  return (
    <>
      <AdminPageHeader title="Users" subtitle="Admin accounts and student management" />
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header"><h5 className="mb-0">Admin Users</h5></div>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td>{a.full_name as string}<br /><small className="text-muted">{a.email as string}</small></td>
                      <td>{a.role as string}</td>
                      <td>{a.status as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5>Students</h5>
              <p className="text-muted">{Number(studentCount[0]?.c || 0)} registered students</p>
              <Link href="/admin/students" className="btn btn-primary">Manage Students</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
