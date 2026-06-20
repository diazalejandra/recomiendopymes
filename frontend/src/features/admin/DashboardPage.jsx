import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { 
  Users, 
  Store, 
  Clock, 
  MessageSquareQuote, 
  ShieldAlert, 
  EyeOff,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminApi.getDashboard()
      .then(d => {
        setStats(d);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { 
      label: 'Total Usuarios', 
      value: stats?.users?.total ?? 0, 
      icon: Users,
      color: 'blue',
      link: '/admin/usuarios'
    },
    { 
      label: 'Negocios Activos', 
      value: stats?.businesses?.active ?? 0, 
      icon: Store,
      color: 'emerald',
      link: '/admin/emprendimientos?status=active'
    },
    { 
      label: 'Pendientes de Aprob.', 
      value: stats?.businesses?.pending ?? 0, 
      icon: Clock,
      color: 'amber',
      link: '/admin/emprendimientos?status=pending'
    },
    { 
      label: 'Total Reseñas', 
      value: stats?.reviews?.total ?? 0, 
      icon: MessageSquareQuote,
      color: 'purple',
      link: '/admin/resenas'
    },
    { 
      label: 'Usuarios Sospechosos', 
      value: stats?.users?.suspicious ?? 0, 
      icon: ShieldAlert,
      color: 'red',
      link: '/admin/usuarios'
    },
    { 
      label: 'Reseñas Ocultas', 
      value: stats?.reviews?.hidden ?? 0, 
      icon: EyeOff,
      color: 'orange',
      link: '/admin/resenas'
    },
  ];

  const getColorClasses = (color) => {
    const map = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      red: 'bg-red-50 text-red-600 border-red-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
    };
    return map[color] || map.blue;
  };

  const isWarningCard = (color, value) => {
    if (value <= 0) return false;
    return color === 'amber' || color === 'red';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-primary" />
            Visión General
          </h1>
          <p className="text-sm text-gray-500 mt-1">Métricas principales de RecomiendoPymes.</p>
        </div>
        
        {error && (
          <div className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 font-medium shadow-sm">
            <ShieldAlert size={16} />
            Error conectando con el servidor
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} 
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group flex items-start justify-between relative overflow-hidden">
            
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <Icon size={120} />
            </div>

            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</span>
                {isWarningCard(color, value) && color === 'amber' && <TrendingUp size={16} className="text-amber-500" strokeWidth={3} />}
                {isWarningCard(color, value) && color === 'red' && <ShieldAlert size={16} className="text-red-500" strokeWidth={3} />}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${getColorClasses(color)} relative z-10`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
          </Link>
        ))}
      </div>

      {stats?.latest_businesses?.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Últimos Emprendimientos Pendientes</h2>
            <Link to="/admin/emprendimientos" className="text-sm font-medium text-primary hover:underline">
              Ver todos &rarr;
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Nombre del Negocio</th>
                  <th className="px-6 py-4">Ciudad</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.latest_businesses.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                    <td className="px-6 py-4 text-gray-500">{b.city}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'}`}>
                        {b.status === 'active' ? 'Activo' : b.status === 'pending' ? 'Pendiente' : b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
