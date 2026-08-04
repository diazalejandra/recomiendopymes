'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`¡Bienvenido, ${user.name}!`);
      router.push(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Credenciales incorrectas. Verifica tu email y contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: '0.95rem',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    background: 'var(--surface)', color: 'var(--ink)',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Outfit, sans-serif',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <div className="hidden lg:flex" style={{ width: '42%', background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)', flexDirection: 'column', justifyContent: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" className="flex items-center gap-2 mb-12" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Recomiendo</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E40AF', background: '#fff', padding: '2px 10px', borderRadius: '8px', fontFamily: 'Outfit, sans-serif' }}>Pymes</span>
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
            Conecta con emprendedores de todo Chile
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Descubre negocios locales, deja reseñas y apoya el emprendimiento chileno desde tu comunidad.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Link href="/" className="flex items-center gap-2 mb-8 text-sm font-medium" style={{ color: 'var(--brand)', background: 'var(--brand-light)', padding: '8px 14px', borderRadius: '999px', textDecoration: 'none', width: 'fit-content' }}>
            <ArrowLeft size={16} /> Volver al inicio
          </Link>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Bienvenido de vuelta</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>Ingresa tus datos para acceder a tu cuenta</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Correo electrónico</label>
              <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.cl" style={inputStyle} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Contraseña</label>
                <Link href="/recuperar-contrasena" style={{ fontSize: '0.8rem', color: 'var(--brand)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, padding: '12px 44px 12px 14px' }} />
                <button type="button" onClick={() => setShowPwd((p) => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: '0.95rem', fontWeight: 700, color: '#fff', background: loading ? 'var(--muted)' : 'var(--brand)', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
