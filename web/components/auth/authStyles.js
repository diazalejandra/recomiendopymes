// Estilos compartidos para las páginas de auth "simples" (recuperar, verificar, reset),
// para que sean consistentes con login/registro y el resto del sitio (tokens + Outfit).
export const authInput = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '0.95rem',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  background: 'var(--surface)',
  color: 'var(--ink)',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'Outfit, sans-serif',
};

export const authButton = (disabled) => ({
  width: '100%',
  padding: '13px',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#fff',
  background: disabled ? 'var(--muted)' : 'var(--brand)',
  border: 'none',
  borderRadius: '10px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Outfit, sans-serif',
});

export const authShellStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg)',
  padding: '2rem',
};

export const authCardStyle = {
  width: '100%',
  maxWidth: '440px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '2.5rem 2rem',
  boxShadow: '0 4px 28px rgba(15,23,42,0.06)',
  textAlign: 'center',
};
