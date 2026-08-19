'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

function CrudForm({
  apiBase,
  fields,
  initial,
  listHref,
  title,
}: {
  apiBase: string;
  listHref: string;
  title: string;
  initial?: Record<string, unknown>;
  fields: Array<{ key: string; label: string; type?: string; required?: boolean; rows?: number }>;
}) {
  const router = useRouter();
  const id = initial?.id as number | undefined;
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(
      fields.map((f) => [f.key, String(initial?.[f.key] ?? (f.key === 'status' ? 'active' : f.key === 'display_order' ? '0' : ''))])
    )
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, ...(id ? { id } : {}), display_order: Number(form.display_order || 0) };
    const res = await fetch(id ? `${apiBase}/${id}` : apiBase, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push(listHref);
      router.refresh();
    } else setError(data.message || 'Save failed');
  }

  return (
    <div className="card">
      <div className="card-header"><h5 className="mb-0">{title}</h5></div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="mb-3" key={f.key}>
              <label className="form-label">{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'textarea' ? (
                <textarea className="form-control" rows={f.rows || 4} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
              ) : f.type === 'select-active' ? (
                <select className="form-select" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <input type={f.type || 'text'} className="form-control" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
              )}
            </div>
          ))}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <Link href={listHref} className="btn btn-outline-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LeadershipForm({ initial }: { initial?: Record<string, unknown> }) {
  return (
    <CrudForm
      apiBase="/api/admin/leadership"
      listHref="/admin/leadership"
      title={initial?.id ? 'Edit Leader' : 'Add Leader'}
      initial={initial}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'role', label: 'Role' },
        { key: 'departments', label: 'Departments (comma-separated)' },
        { key: 'bio', label: 'Bio', type: 'textarea', rows: 5 },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'image_url', label: 'Image URL' },
        { key: 'status', label: 'Status', type: 'select-active' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ]}
    />
  );
}

export function GalleryForm({ initial }: { initial?: Record<string, unknown> }) {
  return (
    <CrudForm
      apiBase="/api/admin/gallery"
      listHref="/admin/gallery"
      title={initial?.id ? 'Edit Album' : 'Add Album'}
      initial={initial}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'google_photos_url', label: 'Google Photos URL', required: true },
        { key: 'cover_image', label: 'Cover Image URL' },
        { key: 'status', label: 'Status', type: 'select-active' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ]}
    />
  );
}
