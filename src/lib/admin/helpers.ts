import { sanitize } from '@/lib/utils/media';

export function parseJsonBody<T extends Record<string, unknown>>(body: T) {
  return body;
}

export function cleanString(value: unknown, fallback = ''): string {
  return sanitize(String(value ?? fallback));
}

export function cleanOptionalString(value: unknown): string | null {
  const s = cleanString(value).trim();
  return s || null;
}

export function cleanEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  const v = String(value ?? '') as T;
  return allowed.includes(v) ? v : fallback;
}
