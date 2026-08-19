import type { Metadata } from 'next';
import { Suspense } from 'react';
import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata: Metadata = {
  title: 'Sign in - School of Christ Academy',
};

export default function StudentLoginPage() {
  return (
    <Suspense>
      <UnifiedLoginPage />
    </Suspense>
  );
}
