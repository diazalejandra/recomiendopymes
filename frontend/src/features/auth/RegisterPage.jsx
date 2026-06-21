import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
    if (!acceptedTerms) return toast.error('Debes aceptar los Términos y la Política de Privacidad');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, acceptedTerms);
      toast.success('¡Cuenta creada! Revisa tu email para verificarla.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: '0.95rem',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    background: 'var(--surface)', color: 'var(--ink)',
    outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'Outfit, sans-serif',
  };

  const fields = [
    { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', autoComplete: 'name' },
    { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.cl', autoComplete: 'email' },
    { id: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres', autoComplete: 'new-password' },
    { id: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ];

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
            Únete a la comunidad de emprendedores
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
            lineHeight: 1.6, maxWidth: '400px',
          }}>
            Crea tu cuenta gratis, inscribe tu negocio y llega a más clientes en tu ciudad.
          </p>

          <div style={{
            marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            {[
              '✓ Inscripción gratuita para tu negocio',
              '✓ Aparece en el mapa y catálogo',
              '✓ Recibe reseñas de tus clientes',
              '✓ Link directo a tus redes sociales',
            ].map(text => (
              <p key={text} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{text}</p>
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

          <Link to="/" className="flex items-center gap-2 mb-8 text-sm font-medium transition-all"
            style={{ 
              color: 'var(--brand)', 
              background: 'var(--brand-light)',
              padding: '8px 14px',
              borderRadius: '999px',
              textDecoration: 'none',
              width: 'fit-content'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-light)'}>
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          <div className="lg:hidden mb-6">
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
            Crea tu cuenta
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Es gratis y solo toma un minuto
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {fields.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={`reg-${id}`} style={{
                  display: 'block', fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--ink)', marginBottom: '6px',
                }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id={`reg-${id}`} name={id}
                    type={(id === 'password' || id === 'confirm') ? (showPwd ? 'text' : 'password') : type}
                    required autoComplete={autoComplete}
                    value={form[id]} onChange={handleChange}
                    placeholder={placeholder}
                    style={id === 'password' || id === 'confirm'
                      ? { ...inputStyle, paddingRight: '44px' }
                      : inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  {id === 'password' && (
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px',
                      }}>
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5, cursor: 'pointer',
            }}>
              <input
                type="checkbox" required
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--brand)', cursor: 'pointer' }}
              />
              <span>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Términos y Condiciones</Link>
                {' '}y la{' '}
                <Link to="/privacidad" target="_blank" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Política de Privacidad</Link>.
              </span>
            </label>

            <button
              type="submit" disabled={loading || !acceptedTerms}
              style={{
                width: '100%', padding: '13px', fontSize: '0.95rem',
                fontWeight: 700, color: '#fff',
                background: (loading || !acceptedTerms) ? 'var(--muted)' : 'var(--brand)',
                border: 'none', borderRadius: '10px', cursor: (loading || !acceptedTerms) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                fontFamily: 'Outfit, sans-serif',
                marginTop: '0.25rem',
              }}
              onMouseEnter={e => { if (!loading && acceptedTerms) e.currentTarget.style.background = 'var(--brand-hover)'; }}
              onMouseLeave={e => { if (!loading && acceptedTerms) e.currentTarget.style.background = 'var(--brand)'; }}
              onMouseDown={e => { if (!loading && acceptedTerms) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.75rem',
            fontSize: '0.9rem', color: 'var(--muted)',
          }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: 'var(--brand)', fontWeight: 600, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
