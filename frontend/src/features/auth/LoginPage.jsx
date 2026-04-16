import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`¡Bienvenido, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left panel — branded ── */}
      <div className="hidden lg:flex" style={{
        width: '42%',
        background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-120px', left: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" className="flex items-center gap-2 mb-12" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
              Recomiendo
            </span>
            <span style={{
              fontSize: '1.5rem', fontWeight: 800, color: '#1E40AF',
              background: '#fff', padding: '2px 10px', borderRadius: '8px',
              fontFamily: 'Outfit, sans-serif',
            }}>
              Pymes
            </span>
          </Link>

          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, color: '#fff',
            lineHeight: 1.2, marginBottom: '1.5rem',
            fontFamily: 'Outfit, sans-serif',
          }}>
            Conecta con emprendedores de todo Chile
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
            lineHeight: 1.6, maxWidth: '400px',
          }}>
            Descubre negocios locales, deja reseñas y apoya el emprendimiento chileno desde tu comunidad.
          </p>

          <div style={{
            marginTop: '3rem', display: 'flex', gap: '2rem',
          }}>
            {[
              { num: '500+', label: 'Emprendedores' },
              { num: '1.2K', label: 'Reseñas' },
              { num: '15', label: 'Ciudades' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{num}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Back link */}
          <Link to="/" className="flex items-center gap-1.5 mb-8 text-sm transition-colors"
            style={{ color: 'var(--muted)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-1.5" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit' }}>
                Recomiendo
              </span>
              <span style={{
                fontSize: '1.25rem', fontWeight: 800, color: '#fff',
                background: 'var(--brand)', padding: '1px 8px', borderRadius: '6px',
                fontFamily: 'Outfit',
              }}>
                Pymes
              </span>
            </Link>
          </div>

          <h2 style={{
            fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)',
            fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem',
          }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Ingresa tus datos para acceder a tu cuenta
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{
                display: 'block', fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--ink)', marginBottom: '6px',
              }}>
                Correo electrónico
              </label>
              <input
                id="login-email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.cl"
                style={{
                  width: '100%', padding: '12px 14px', fontSize: '0.95rem',
                  border: '1.5px solid var(--border)', borderRadius: '10px',
                  background: 'var(--surface)', color: 'var(--ink)',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'Outfit, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{
                  fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)',
                }}>
                  Contraseña
                </label>
                <Link to="/recuperar-contrasena" style={{
                  fontSize: '0.8rem', color: 'var(--brand)', textDecoration: 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', fontSize: '0.95rem',
                    border: '1.5px solid var(--border)', borderRadius: '10px',
                    background: 'var(--surface)', color: 'var(--ink)',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px',
                  }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', fontSize: '0.95rem',
                fontWeight: 700, color: '#fff',
                background: loading ? 'var(--muted)' : 'var(--brand)',
                border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                fontFamily: 'Outfit, sans-serif',
                marginTop: '0.5rem',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--brand-hover)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--brand)'; }}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Register link */}
          <p style={{
            textAlign: 'center', marginTop: '2rem',
            fontSize: '0.9rem', color: 'var(--muted)',
          }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{
              color: 'var(--brand)', fontWeight: 600, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
