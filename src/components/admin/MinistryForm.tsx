'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function MinistryForm({ initial }: { initial?: Record<string, unknown> }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: initial?.id as number | undefined,
    name: (initial?.name as string) || '',
    description: (initial?.description as string) || '',
    leader_name: (initial?.leader_name as string) || '',
    image_url: (initial?.image_url as string) || '',
    contact_email: (initial?.contact_email as string) || '',
    status: (initial?.status as string) || 'active',
    display_order: String(initial?.display_order ?? 0),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const isEdit = Boolean(form.id);
    const res = await fetch(isEdit ? `/api/admin/ministries/${form.id}` : '/api/admin/ministries', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, display_order: Number(form.display_order) }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push('/admin/ministries');
      router.refresh();
    } else setError(data.message || 'Save failed');
  }

  return (
    <div className="card">
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name *</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Leader Name</label>
            <input className="form-control" value={form.leader_name} onChange={(e) => setForm({ ...form, leader_name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input className="form-control" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Display Order</label>
              <input type="number" className="form-control" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <Link href="/admin/ministries" className="btn btn-outline-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
