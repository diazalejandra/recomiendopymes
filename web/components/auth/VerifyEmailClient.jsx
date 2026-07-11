'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { authButton, authShellStyle, authCardStyle } from '@/components/auth/authStyles';

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-1 mb-6" style={{ textDecoration: 'none' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit' }}>Recomiendo</span>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', background: 'var(--brand)', padding: '1px 8px', borderRadius: '6px', fontFamily: 'Outfit' }}>Pymes</span>
    </Link>
  );
}

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        refreshUser();
      })
      .catch(() => setStatus('error'));
  }, [token, refreshUser]);

  return (
    <div style={authShellStyle}>
      <div style={authCardStyle}>
        <Logo />
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand)' }} />
            <p style={{ color: 'var(--muted)' }}>Verificando tu email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.5rem' }}>¡Email verificado!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Ya puedes dejar reseñas en el catálogo.</p>
            <Link href="/" style={{ ...authButton(false), display: 'inline-block', width: 'auto', padding: '11px 24px', textDecoration: 'none' }}>Ir al catálogo</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.5rem' }}>Enlace inválido o expirado</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>El enlace de verificación no es válido o ya expiró.</p>
            <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>Volver al inicio de sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
