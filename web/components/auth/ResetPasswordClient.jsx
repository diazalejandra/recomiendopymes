'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 8) return toast.error('Mínimo 8 caracteres');
    if (!token) return toast.error('Token inválido');
    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password);
      toast.success('Contraseña actualizada correctamente');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={authShellStyle}>
        <div style={authCardStyle}>
          <Logo />
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.5rem' }}>Enlace inválido o expirado</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>El enlace no es válido. Solicita uno nuevo.</p>
          <Link href="/recuperar-contrasena" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={authShellStyle}>
      <div style={authCardStyle}>
        <Logo />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1.5rem' }}>Nueva contraseña</h2>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 'password', label: 'Nueva contraseña', placeholder: 'Mínimo 8 caracteres' },
            { id: 'confirm', label: 'Confirmar contraseña', placeholder: '••••••••' },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>{label}</label>
              <input id={id} name={id} type="password" required value={form[id]} onChange={(e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))} placeholder={placeholder} style={authInput} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={authButton(loading)}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
