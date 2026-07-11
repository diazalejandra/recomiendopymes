'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '@/utils/api';
import { authInput, authButton, authShellStyle, authCardStyle } from '@/components/auth/authStyles';

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-1 mb-6" style={{ textDecoration: 'none' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit' }}>Recomiendo</span>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', background: 'var(--brand)', padding: '1px 8px', borderRadius: '6px', fontFamily: 'Outfit' }}>Pymes</span>
    </Link>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Error al enviar el email. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authShellStyle}>
      <div style={authCardStyle}>
        <Logo />
        {sent ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.5rem' }}>Revisa tu email</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Si el email existe en nuestro sistema, recibirás las instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>Volver al inicio de sesión</Link>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.5rem' }}>Recuperar contraseña</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Correo electrónico</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.cl" style={authInput} />
              </div>
              <button type="submit" disabled={loading} style={authButton(loading)}>
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/login" className="inline-flex items-center gap-1.5" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
