'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

type Admin = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  last_login?: string;
};

export default function AdminSettingsClient({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', role: 'admin' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/admins')
      .then((r) => r.json())
      .then((d) => setAdmins(d.data || []));
  }, []);

  async function createAdmin(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Admin created');
      setForm({ username: '', email: '', full_name: '', password: '', role: 'admin' });
      router.refresh();
      const list = await fetch('/api/admin/admins').then((r) => r.json());
      setAdmins(list.data || []);
    } else {
      setMessage(data.message || 'Failed');
    }
  }

  async function changePassword(id: number) {
    const password = prompt('New password (min 8 chars):');
    if (!password) return;
    await fetch(`/api/admin/admins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setMessage('Password updated');
  }

  async function deleteAdmin(id: number) {
    if (!confirm('Delete this admin?')) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert(data.message);
    }
  }

  if (!isSuperAdmin) {
    return <div className="alert alert-warning">Only super admins can manage admin accounts here.</div>;
  }

  return (
    <div className="row g-4">
      {message && <div className="col-12"><div className="alert alert-info">{message}</div></div>}
      <div className="col-lg-5">
        <div className="card">
          <div className="card-header"><h5 className="mb-0">Add Admin</h5></div>
          <div className="card-body">
            <form onSubmit={createAdmin}>
              {(['username', 'email', 'full_name', 'password'] as const).map((f) => (
                <div className="mb-3" key={f}>
                  <label className="form-label text-capitalize">{f.replace('_', ' ')}</label>
                  <input
                    className="form-control"
                    type={f === 'password' ? 'password' : 'text'}
                    required
                    value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  />
                </div>
              ))}
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="discipleship_admin">Discipleship Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create Admin</button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="card">
          <div className="card-header"><h5 className="mb-0">Admin Accounts</h5></div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.full_name}</strong><br /><small>{a.username} · {a.email}</small></td>
                    <td>{a.role}</td>
                    <td>{a.status}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => changePassword(a.id)}>Password</button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => deleteAdmin(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
