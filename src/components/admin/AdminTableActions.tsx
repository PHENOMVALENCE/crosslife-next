'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({
  apiUrl,
  confirmMessage = 'Delete this item?',
}: {
  apiUrl: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) router.refresh();
      else alert(data.message || 'Delete failed');
    } catch {
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDelete} disabled={loading}>
      <i className="bi bi-trash"></i>
    </button>
  );
}

export function AdminTableActions({
  editHref,
  deleteApiUrl,
}: {
  editHref: string;
  deleteApiUrl: string;
}) {
  return (
    <div className="btn-group">
      <Link href={editHref} className="btn btn-sm btn-outline-primary">
        <i className="bi bi-pencil"></i>
      </Link>
      <DeleteButton apiUrl={deleteApiUrl} />
    </div>
  );
}
