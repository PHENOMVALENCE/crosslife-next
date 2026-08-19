'use client';

import { useState } from 'react';

export default function FileUploadField({
  label,
  subdir,
  type = 'image',
  value,
  onChange,
}: {
  label: string;
  subdir: string;
  type?: 'image' | 'audio' | 'video' | 'pdf' | 'sermon';
  value: string;
  onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('subdir', subdir);
    form.append('type', type);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        onChange(data.path);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="d-flex gap-2 align-items-start flex-wrap">
        <input type="file" className="form-control" onChange={handleFile} disabled={uploading} />
        {uploading && <span className="small text-muted">Uploading…</span>}
      </div>
      {value && (
        <p className="small text-muted mt-1 mb-0">
          Current: <code>{value}</code>
        </p>
      )}
      {error && <p className="text-danger small mb-0">{error}</p>}
    </div>
  );
}
