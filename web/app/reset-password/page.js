import { Suspense } from 'react';
import ResetPasswordClient from '@/components/auth/ResetPasswordClient';

export const metadata = { title: 'Restablecer contraseña', robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
