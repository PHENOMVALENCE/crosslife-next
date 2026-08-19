import fs from 'fs/promises';
import path from 'path';

const RATE_DIR = path.join(process.cwd(), 'storage', 'rate-limits');

export async function rateLimitAllow(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  await fs.mkdir(RATE_DIR, { recursive: true });
  const file = path.join(RATE_DIR, bucket.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json');
  const now = Date.now();
  let hits: number[] = [];
  try {
    const raw = await fs.readFile(file, 'utf8');
    const data = JSON.parse(raw);
    hits = (data.hits || []).filter((t: number) => now - t < windowSeconds * 1000);
  } catch {
    /* no file */
  }
  if (hits.length >= max) return false;
  hits.push(now);
  await fs.writeFile(file, JSON.stringify({ hits }));
  return true;
}
