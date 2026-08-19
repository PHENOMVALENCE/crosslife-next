'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type EventFormData = {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  end_date: string;
  end_time: string;
  location: string;
  event_type: string;
  image_url: string;
  status: string;
};

export default function EventForm({ initial }: { initial?: Partial<EventFormData> }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EventFormData>({
    title: initial?.title || '',
    description: initial?.description || '',
    event_date: initial?.event_date?.slice(0, 10) || '',
    event_time: initial?.event_time || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    end_time: initial?.end_time || '',
    location: initial?.location || '',
    event_type: initial?.event_type || '',
    image_url: initial?.image_url || '',
    status: initial?.status || 'upcoming',
    id: initial?.id,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const isEdit = Boolean(form.id);
    const res = await fetch(isEdit ? `/api/admin/events/${form.id}` : '/api/admin/events', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push('/admin/events');
      router.refresh();
    } else setError(data.message || 'Save failed');
  }

  return (
    <div className="card">
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Event Date *</label>
              <input type="date" className="form-control" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Event Time</label>
              <input type="time" className="form-control" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Event Type</label>
            <input className="form-control" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input className="form-control" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <Link href="/admin/events" className="btn btn-outline-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
