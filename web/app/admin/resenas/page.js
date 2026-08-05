'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search, MessageSquareQuote, Eye, EyeOff, Store, ExternalLink } from 'lucide-react';
import { adminApi } from '@/utils/api';

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'visible', label: 'Visibles' },
  { id: 'hidden', label: 'Ocultas' },
];

export default function ReviewsTable() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getReviews({ limit: 100 })
      .then((d) => setReviews(d.reviews || []))
      .catch(() => toast.error('Error al cargar reseñas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await adminApi.toggleReviewVisibility(id); toast.success('Visibilidad actualizada'); load(); }
    catch { toast.error('Error al actualizar'); }
  };

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filter === 'visible') result = result.filter((r) => r.is_visible);
    if (filter === 'hidden') result = result.filter((r) => !r.is_visible);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((r) => r.author_name?.toLowerCase().includes(s) || r.business_name?.toLowerCase().includes(s) || r.comment?.toLowerCase().includes(s));
    }
    return result;
  }, [reviews, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="text-primary" />
          Moderación de Reseñas
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por autor, negocio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {tab.label}
            <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-600">
              {tab.id === 'all' ? reviews.length : tab.id === 'visible' ? reviews.filter((r) => r.is_visible).length : reviews.filter((r) => !r.is_visible).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />)}</div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4"><MessageSquareQuote className="text-gray-400" size={32} /></div>
          <p className="text-gray-900 font-medium mb-1">No hay reseñas encontradas</p>
          <p className="text-sm text-gray-500">Prueba cambiando los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Autor & Negocio</th>
                  <th className="px-6 py-4 whitespace-nowrap">Calificación</th>
                  <th className="px-6 py-4">Comentario</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className={`hover:bg-gray-50/50 transition-colors ${!r.is_visible ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{r.author_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Store size={12} /> {r.business_name || 'Negocio Desconocido'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-amber-500" title={`${r.rating} estrellas`}>
                        {Array.from({ length: 5 }).map((_, i) => (<span key={i} className={i < r.rating ? 'opacity-100' : 'opacity-20 text-gray-300'}>★</span>))}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[300px]"><p className={`text-gray-600 line-clamp-2 ${!r.is_visible ? 'italic' : ''}`}>{r.comment}</p></td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {r.is_visible ? 'Visible' : 'Oculta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {r.business_slug && (
                          <Link href={`/emprendimiento/${r.business_slug}`} target="_blank" title="Ver emprendimiento" className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                            <ExternalLink size={16} />
                          </Link>
                        )}
                        <button onClick={() => toggle(r.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${r.is_visible ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                          {r.is_visible ? <><EyeOff size={14} /> Ocultar</> : <><Eye size={14} /> Mostrar</>}
                        </button>
                      </div>
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
