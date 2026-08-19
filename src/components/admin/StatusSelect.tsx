'use client';

import { useRouter } from 'next/navigation';

export default function StatusSelect({
  id,
  apiPath,
  value,
  options,
}: {
  id: number;
  apiPath: string;
  value: string;
  options: string[];
}) {
  const router = useRouter();

  async function onChange(next: string) {
    await fetch(`${apiPath}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <select className="form-select form-select-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
