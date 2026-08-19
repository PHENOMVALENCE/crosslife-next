import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import PublicLayout from '@/components/public/PublicLayout';
import HtmlContentPage from '@/components/public/HtmlContentPage';

export const metadata: Metadata = {
  title: 'Contact Us - CrossLife Mission Network',
  description: 'Contact CrossLife Mission Network. We welcome you to connect with us.',
};

export default function ContactPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'src/components/public/contact/contact-content.html'),
    'utf8'
  );
  return (
    <PublicLayout>
      <HtmlContentPage html={html} />
    </PublicLayout>
  );
}
