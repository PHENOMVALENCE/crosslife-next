export function env(key: string, fallback = ''): string {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : fallback;
}

export function envBool(key: string, fallback = false): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const appConfig = {
  siteName: env('MAIL_FROM_NAME', 'CrossLife Mission Network'),
  siteUrl: env('SITE_URL', 'http://localhost:3000'),
  uploadPathRelative: 'assets/img/uploads/',
  timezone: 'Africa/Dar_es_Salaam',
};
