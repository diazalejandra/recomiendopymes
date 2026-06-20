import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        refreshUser();
      })
      .catch(() => setStatus('error'));
  }, [token, refreshUser]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Verificando tu email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow">
        {status === 'success' ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email verificado!</h2>
            <p className="text-gray-600 mb-6">Ya puedes dejar reseñas en el catálogo.</p>
            <Link to="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
              Ir al catálogo
            </Link>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido o expirado</h2>
            <p className="text-gray-600 mb-6">El enlace de verificación no es válido o ya expiró.</p>
            <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
