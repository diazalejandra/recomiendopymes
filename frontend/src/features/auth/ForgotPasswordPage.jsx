import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { toast } from 'sonner';

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

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu email</h2>
          <p className="text-gray-600 mb-6">
            Si el email existe en nuestro sistema, recibirás las instrucciones para restablecer tu contraseña.
          </p>
          <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 relative pt-4">
        <Link to="/" className="absolute top-0 left-0 flex items-center gap-2 text-sm font-medium transition-all"
          style={{ 
            color: 'var(--brand)', 
            background: 'var(--brand-light)',
            padding: '6px 12px',
            borderRadius: '999px',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-light)'}>
          <span>←</span> Volver al inicio
        </Link>
        
        <div className="pt-8">
          <Link to="/" className="text-2xl font-bold text-primary block text-center">RecomiendoPymes</Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Recuperar contraseña</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email" type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu@email.cl"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
