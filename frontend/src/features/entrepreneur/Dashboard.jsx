import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessApi.getMine()
      .then(data => setBusinesses(data.businesses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-500',
  };
  const statusLabels = { active: 'Activo', pending: 'Pendiente', inactive: 'Inactivo' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis emprendimientos</h1>
        <p className="text-gray-500 text-sm mt-1">Hola, {user?.name}</p>
      </div>

      <div className="mb-6">
        <Link to="/inscribir"
          className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
          + Inscribir nuevo emprendimiento
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🏪</p>
          <p className="text-lg font-medium mb-2">No tienes emprendimientos inscritos</p>
          <Link to="/inscribir" className="text-primary hover:underline text-sm">Inscribir mi primer emprendimiento</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 items-start">
              {b.image && (
                <img src={b.image} alt={b.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{b.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-500'}`}>
                    {statusLabels[b.status] || b.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{b.category} · {b.city}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>★ {b.rating > 0 ? b.rating.toFixed(1) : '—'}</span>
                  <span>{b.review_count} reseña{b.review_count !== 1 ? 's' : ''}</span>
                  <span>{b.view_count} vistas</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/mi-negocio/editar/${b.id}`}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  Editar
                </Link>
                <Link to={`/mi-negocio/resenas/${b.id}`}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  Reseñas
                </Link>
                {b.status === 'active' && (
                  <Link to={`/emprendimiento/${b.slug}`}
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90">
                    Ver perfil
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
