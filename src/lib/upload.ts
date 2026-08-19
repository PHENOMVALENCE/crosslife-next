import fs from 'fs/promises';
import path from 'path';
import { env } from './env';

export const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'assets', 'img', 'uploads');
export const UPLOAD_RELATIVE = 'assets/img/uploads/';

export async function ensureUploadDir(subdir: string) {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveUpload(file: File, subdir: string, prefix: string): Promise<string> {
  const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const safeName = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = await ensureUploadDir(subdir);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safeName), buffer);
  return `${UPLOAD_RELATIVE}${subdir}/${safeName}`;
}

export const ALLOWED = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a'],
  video: ['.mp4', '.webm', '.mov'],
  pdf: ['.pdf'],
  sermon: ['.mp3', '.wav', '.ogg', '.m4a', '.pdf'],
};

export function isAllowedExt(filename: string, allowed: string[]) {
  const ext = path.extname(filename).toLowerCase();
  return allowed.includes(ext);
}

export function maxBytes(mb: number) {
  return mb * 1024 * 1024;
}

export const siteUrl = () => env('SITE_URL', 'http://localhost:3000');
