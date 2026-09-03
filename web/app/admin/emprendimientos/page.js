'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search, Store, CheckCircle, XCircle, Ban, RotateCcw, ExternalLink } from 'lucide-react';
import { adminApi, apiErrorMessage } from '@/utils/api';

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

export default function BusinessesTable() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getBusinesses({ limit: 100 })
      .then((d) => setBusinesses(d.businesses || []))
      .catch(() => toast.error('Error al cargar emprendimientos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await adminApi.approvesBusiness(id); toast.success('Emprendimiento aprobado'); load(); }
    catch (e) { toast.error(apiErrorMessage(e, 'Error al aprobar')); }
  };
  const reject = async (id) => {
    try { await adminApi.rejectBusiness(id); toast.success('Emprendimiento rechazado'); load(); }
    catch (e) { toast.error(apiErrorMessage(e, 'Error al rechazar')); }
  };

  const filteredBusinesses = useMemo(() => {
    let result = businesses;
    if (filter !== 'all') result = result.filter((b) => b.status === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(s) || b.city.toLowerCase().includes(s) || b.owner?.toLowerCase().includes(s));
    }
    return result;
  }, [businesses, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="text-primary" />
          Emprendimientos
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por nombre, ciudad..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {tab.label}
            <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-600">
              {tab.id === 'all' ? businesses.length : businesses.filter((b) => b.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />)}</div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4"><Store className="text-gray-400" size={32} /></div>
          <p className="text-gray-900 font-medium mb-1">No hay emprendimientos encontrados</p>
          <p className="text-sm text-gray-500">Prueba cambiando los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Negocio</th>
                  <th className="px-6 py-4">Rubro</th>
                  <th className="px-6 py-4">Ciudad</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4"><p className="font-medium text-gray-900">{b.name}</p></td>
                    <td className="px-6 py-4 align-middle"><span className="text-xs text-brand bg-brand-light inline-flex items-center px-2 py-0.5 rounded">{b.category}</span></td>
                    <td className="px-6 py-4"><p className="text-gray-900">{b.city}</p></td>
                    <td className="px-6 py-4 text-gray-600">{b.owner || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {b.status === 'active' ? 'Activo' : b.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => approve(b.id)} title="Aprobar" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle size={18} /></button>
                            <button onClick={() => reject(b.id)} title="Rechazar" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={18} /></button>
                          </>
                        )}
                        {b.status === 'active' && (
                          <button onClick={() => reject(b.id)} title="Desactivar" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Ban size={18} /></button>
                        )}
                        {b.status === 'inactive' && (
                          <button onClick={() => approve(b.id)} title="Reactivar" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><RotateCcw size={18} /></button>
                        )}
                        {b.slug && (
                          <Link href={`/emprendimiento/${b.slug}`} target="_blank" title="Ver en sitio" className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"><ExternalLink size={18} /></Link>
                        )}
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
