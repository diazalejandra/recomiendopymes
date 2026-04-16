import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 8) return toast.error('Mínimo 8 caracteres');
    if (!token) return toast.error('Token inválido');
    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password);
      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">Enlace inválido o expirado</p>
          <Link to="/recuperar-contrasena" className="text-primary hover:underline">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="text-2xl font-bold text-primary block text-center">RecomiendoPymes</Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Nueva contraseña</h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {[
            { id: 'password', label: 'Nueva contraseña', placeholder: 'Mínimo 8 caracteres' },
            { id: 'confirm', label: 'Confirmar contraseña', placeholder: '••••••••' },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                id={id} name={id} type="password" required
                value={form[id]} onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
