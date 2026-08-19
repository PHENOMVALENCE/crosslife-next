'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MarkStudiedButton({
  enrollmentId,
  moduleId,
  studied,
}: {
  enrollmentId: number;
  moduleId: number;
  studied: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(studied);
  const [loading, setLoading] = useState(false);

  if (done) {
    return (
      <div className="alert alert-success">
        <i className="bi bi-check-circle me-2"></i>
        You have marked this module as studied. You may now take the assessment.
      </div>
    );
  }

  async function markStudied() {
    setLoading(true);
    const res = await fetch('/api/student/module/studied', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, moduleId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setDone(true);
      router.refresh();
    } else {
      alert(data.message || 'Could not mark as studied');
    }
  }

  return (
    <button type="button" className="btn btn-warning mb-3" onClick={markStudied} disabled={loading}>
      {loading ? 'Saving…' : 'I have finished studying this module'}
    </button>
  );
}
