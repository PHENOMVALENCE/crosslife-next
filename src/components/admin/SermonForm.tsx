'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import FileUploadField from '@/components/admin/FileUploadField';

export type SermonFormData = {
  id?: number;
  title: string;
  description: string;
  speaker: string;
  sermon_type: string;
  youtube_url: string;
  audio_url: string;
  spotify_url: string;
  pdf_url: string;
  thumbnail_url: string;
  sermon_date: string;
  category: string;
  status: string;
};

export default function SermonForm({ initial }: { initial?: Partial<SermonFormData> }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SermonFormData>({
    title: initial?.title || '',
    description: initial?.description || '',
    speaker: initial?.speaker || '',
    sermon_type: initial?.sermon_type || 'video',
    youtube_url: initial?.youtube_url || '',
    audio_url: initial?.audio_url || '',
    spotify_url: initial?.spotify_url || '',
    pdf_url: initial?.pdf_url || '',
    thumbnail_url: initial?.thumbnail_url || '',
    sermon_date: initial?.sermon_date?.slice(0, 10) || '',
    category: initial?.category || '',
    status: initial?.status || 'draft',
    id: initial?.id,
  });

  function update(field: keyof SermonFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const isEdit = Boolean(form.id);
    const url = isEdit ? `/api/admin/sermons/${form.id}` : '/api/admin/sermons';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/sermons');
        router.refresh();
      } else {
        setError(data.message || 'Save failed');
      }
    } catch {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">{form.id ? 'Edit' : 'Add'} Sermon</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={(e) => update('title', e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Speaker</label>
                  <input className="form-control" value={form.speaker} onChange={(e) => update('speaker', e.target.value)} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <input className="form-control" value={form.category} onChange={(e) => update('category', e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">YouTube URL</label>
                <input className="form-control" value={form.youtube_url} onChange={(e) => update('youtube_url', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Audio URL</label>
                <input className="form-control" value={form.audio_url} onChange={(e) => update('audio_url', e.target.value)} />
                <FileUploadField label="Or upload audio" subdir="sermons" type="sermon" value={form.audio_url} onChange={(p) => update('audio_url', p)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Spotify URL</label>
                <input className="form-control" value={form.spotify_url} onChange={(e) => update('spotify_url', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">PDF URL</label>
                <input className="form-control" value={form.pdf_url} onChange={(e) => update('pdf_url', e.target.value)} />
                <FileUploadField label="Or upload PDF" subdir="sermons" type="pdf" value={form.pdf_url} onChange={(p) => update('pdf_url', p)} />
              </div>
              <FileUploadField label="Thumbnail" subdir="sermons" type="image" value={form.thumbnail_url} onChange={(p) => update('thumbnail_url', p)} />
              <div className="mb-3">
                <label className="form-label">Thumbnail URL</label>
                <input className="form-control" value={form.thumbnail_url} onChange={(e) => update('thumbnail_url', e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.sermon_type} onChange={(e) => update('sermon_type', e.target.value)}>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Sermon Date</label>
                <input type="date" className="form-control" value={form.sermon_date} onChange={(e) => update('sermon_date', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Sermon'}
            </button>
            <Link href="/admin/sermons" className="btn btn-outline-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
