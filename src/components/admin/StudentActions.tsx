'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StudentActions({ studentId, status }: { studentId: number; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: string) {
    setLoading(true);
    await fetch(`/api/admin/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === 'pending') {
    return (
      <div className="btn-group btn-group-sm">
        <button type="button" className="btn btn-success" disabled={loading} onClick={() => updateStatus('active')}>
          Approve
        </button>
        <button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={() => updateStatus('inactive')}>
          Reject
        </button>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <button type="button" className="btn btn-sm btn-outline-warning" disabled={loading} onClick={() => updateStatus('inactive')}>
        Deactivate
      </button>
    );
  }

  return (
    <button type="button" className="btn btn-sm btn-outline-success" disabled={loading} onClick={() => updateStatus('active')}>
      Activate
    </button>
  );
}
