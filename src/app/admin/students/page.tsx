import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import StudentActions from '@/components/admin/StudentActions';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  await requireAdmin(DISCIPLESHIP_ROLES);
  const rows = await query<RowDataPacket[]>(
    'SELECT id, email, full_name, phone, status, created_at, last_login FROM discipleship_students ORDER BY created_at DESC LIMIT 200'
  );

  return (
    <>
      <AdminPageHeader title="Students" subtitle="School of Christ Academy — approve pending registrations" />
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>{s.full_name as string}</td>
                  <td>{s.email as string}</td>
                  <td>
                    <span className={`badge bg-${s.status === 'active' ? 'success' : s.status === 'pending' ? 'warning text-dark' : 'secondary'}`}>
                      {s.status as string}
                    </span>
                  </td>
                  <td>{String(s.created_at).slice(0, 10)}</td>
                  <td>
                    <StudentActions studentId={s.id as number} status={s.status as string} />
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
