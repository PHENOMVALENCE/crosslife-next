import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminScripts from '@/components/admin/AdminScripts';
import { requireAdmin } from '@/lib/auth/require-admin';

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
        rel="stylesheet"
      />
      <link href="/assets/css/crosslife-premium.css" rel="stylesheet" />
      <link href="/assets/css/admin-premium.css" rel="stylesheet" />
      <link href="/assets/css/admin-upload.css" rel="stylesheet" />
      <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
      <AdminScripts />
    </>
  );
}
