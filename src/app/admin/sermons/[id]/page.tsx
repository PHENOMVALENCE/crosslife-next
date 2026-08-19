import SermonForm from '@/components/admin/SermonForm';
import { CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function EditSermonPage({ params }: Params) {
  await requireAdmin(CONTENT_ROLES);
  const { id } = await params;
  const rows = await query<RowDataPacket[]>('SELECT * FROM sermons WHERE id = ? LIMIT 1', [Number(id)]);
  if (!rows[0]) notFound();

  const s = rows[0];
  return (
    <SermonForm
      initial={{
        id: s.id as number,
        title: s.title as string,
        description: (s.description as string) || '',
        speaker: (s.speaker as string) || '',
        sermon_type: s.sermon_type as string,
        youtube_url: (s.youtube_url as string) || '',
        audio_url: (s.audio_url as string) || '',
        spotify_url: (s.spotify_url as string) || '',
        pdf_url: (s.pdf_url as string) || '',
        thumbnail_url: (s.thumbnail_url as string) || '',
        sermon_date: s.sermon_date ? String(s.sermon_date) : '',
        category: (s.category as string) || '',
        status: s.status as string,
      }}
    />
  );
}
