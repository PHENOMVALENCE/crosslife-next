import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import PublicLayout from '@/components/public/PublicLayout';
import HomePage from '@/components/public/home/HomePage';

export const metadata: Metadata = {
  title: 'CrossLife Mission Network - Manifesting Sons of God',
  description:
    'CrossLife Mission Network (CMN) is a non-denominational Christian ministry in Dar es Salaam, Tanzania, committed to manifesting Sons of God who understand their identity in Christ.',
};

function getHomeHtml() {
  return fs.readFileSync(
    path.join(process.cwd(), 'src/components/public/home/home-content.html'),
    'utf8'
  );
}

export default function Page() {
  return (
    <PublicLayout includeHomeExtras>
      <HomePage html={getHomeHtml()} />
    </PublicLayout>
  );
}
