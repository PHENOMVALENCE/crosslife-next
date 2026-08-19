import { RowDataPacket } from 'mysql2';
import { query } from '../db';

export type Sermon = RowDataPacket & {
  id: number;
  title: string;
  speaker: string | null;
  sermon_date: string | null;
  sermon_type: string;
  description: string | null;
  category: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  spotify_url: string | null;
  thumbnail_url: string | null;
  status: string;
};

export type Event = RowDataPacket & {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
  image_url: string | null;
  status: string;
};

export type Ministry = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  leader_name: string | null;
  image_url: string | null;
  display_order: number;
  status: string;
};

export type Leader = RowDataPacket & {
  id: number;
  name: string;
  role: string | null;
  departments: string | null;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
};

export type GalleryAlbum = RowDataPacket & {
  title: string;
  description: string | null;
  google_photos_url: string | null;
  cover_image: string | null;
};

export type DiscipleshipProgram = RowDataPacket & {
  id: number;
  program_name: string;
  description: string | null;
  duration: string | null;
  features: string | null;
  status: string;
  display_order: number;
};

export async function getPublishedSermons(limit?: number, type?: string) {
  let sql = "SELECT * FROM sermons WHERE status = 'published'";
  const params: (string | number)[] = [];
  if (type) {
    sql += ' AND sermon_type = ?';
    params.push(type);
  }
  sql += ' ORDER BY sermon_date DESC, created_at DESC';
  if (limit) sql += ` LIMIT ${Number(limit)}`;
  return query<Sermon[]>(sql, params);
}

export async function getPublicEvents(limit?: number) {
  let sql =
    "SELECT * FROM events WHERE status != 'cancelled' ORDER BY (event_date >= CURDATE() OR status = 'ongoing') DESC, event_date ASC, event_time ASC";
  if (limit) sql += ` LIMIT ${Number(limit)}`;
  return query<Event[]>(sql);
}

export async function getActiveMinistries() {
  return query<Ministry[]>(
    "SELECT * FROM ministries WHERE status = 'active' ORDER BY display_order ASC, name ASC"
  );
}

export async function getActiveLeadership() {
  return query<Leader[]>(
    `SELECT id, name, role, COALESCE(departments, '') AS departments, bio, image_url, email, phone
     FROM leadership WHERE status = 'active' ORDER BY display_order ASC, name ASC`
  );
}

export async function getActiveGalleryAlbums() {
  return query<GalleryAlbum[]>(
    "SELECT title, description, google_photos_url, cover_image FROM gallery_albums WHERE status = 'active' ORDER BY display_order ASC, created_at DESC"
  );
}

export async function getActiveDiscipleshipPrograms() {
  return query<DiscipleshipProgram[]>(
    "SELECT * FROM discipleship_programs WHERE status IN ('active', 'upcoming') ORDER BY display_order ASC, program_name ASC"
  );
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await query<RowDataPacket[]>(
    'SELECT setting_key, setting_value FROM site_settings'
  );
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.setting_key as string] = row.setting_value as string;
  }
  return settings;
}
