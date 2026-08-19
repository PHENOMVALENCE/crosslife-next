import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import PublicLayout from '@/components/public/PublicLayout';
import HtmlContentPage from '@/components/public/HtmlContentPage';

export const metadata: Metadata = {
  title: 'Discipleship - School of Christ Academy',
  description: 'CrossLife discipleship programs and School of Christ Academy.',
};

export default function DiscipleshipPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'src/components/public/discipleship/discipleship-content.html'),
    'utf8'
  );
  return (
    <PublicLayout>
      <HtmlContentPage html={html} />
    </PublicLayout>
  );
}
