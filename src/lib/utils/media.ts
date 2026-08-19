import { appConfig } from '../env';

export function imageUrlForDisplay(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  let url = String(imageUrl).trim();

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)) {
    const path = (new URL(url).pathname || '').replace(/^\/+/, '');
    const match = path.match(/^[^/]+\/((?:assets|uploads)\/.+)$/);
    url = match ? match[1] : path;
  }

  if (url.startsWith('http') || url.startsWith('data:')) return url;

  url = url.replace(/\\/g, '/').replace(/^(\.\/|(\.\.\/)+)+/, '').replace(/^\/+/, '');

  if (url && !url.includes('/') && /\.(jpe?g|png|gif|webp)$/i.test(url)) {
    url = `${appConfig.uploadPathRelative}${url}`;
  }

  if (/^uploads\//i.test(url)) {
    url = `assets/img/${url}`;
  }

  const base = appConfig.siteUrl.replace(/\/$/, '');
  return `${base}/${url}`;
}

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^"&?/\s]{11})/,
    /youtube\.com\/shorts\/([^"&?/\s]{11})/,
    /youtube\.com\/live\/([^"&?/\s]{11})/,
    /youtube(?:-nocookie)?\.com\/(?:embed|v)\/([^"&?/\s]{11})/,
    /youtube\.com\/watch.*[?&]v=([^"&?/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getSpotifyEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const embedMatch = trimmed.match(
    /^https?:\/\/open\.spotify\.com\/embed\/(episode|track|show|playlist|album)\/([a-zA-Z0-9]+)/
  );
  if (embedMatch) {
    return `https://open.spotify.com/embed/${embedMatch[1]}/${embedMatch[2]}`;
  }
  const stdMatch = trimmed.match(
    /^https?:\/\/open\.spotify\.com\/(episode|track|show|playlist|album)\/([a-zA-Z0-9]+)/
  );
  if (stdMatch) {
    return `https://open.spotify.com/embed/${stdMatch[1]}/${stdMatch[2]}`;
  }
  return null;
}

export function formatSermonDate(date: string | null | undefined): string {
  if (!date || date === '0000-00-00') return '';
  const ts = Date.parse(date);
  return Number.isNaN(ts) || ts <= 0
    ? ''
    : new Date(ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function sanitize(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function asset(path: string): string {
  return `/assets/${path.replace(/^assets\//, '').replace(/^\//, '')}`;
}
