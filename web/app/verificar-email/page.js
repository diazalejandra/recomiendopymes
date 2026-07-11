import { Suspense } from 'react';
import VerifyEmailClient from '@/components/auth/VerifyEmailClient';

export const metadata = { title: 'Verificar email', robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
