import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { Search, Users, Shield, ShieldAlert, UserX, UserCheck } from 'lucide-react';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ limit: 100 })
      .then(d => setUsers(d.users || []))
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      await adminApi.toggleUser(id);
      toast.success('Estado del usuario actualizado');
      load();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (filter === 'admin') result = result.filter(u => u.role === 'admin');
    if (filter === 'user') result = result.filter(u => u.role === 'user');
    if (filter === 'suspicious') result = result.filter(u => u.is_suspicious);
    
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(s) || 
        u.email?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [users, filter, search]);

  const TABS = [
    { id: 'all', label: 'Todos' },
    { id: 'user', label: 'Usuarios' },
    { id: 'admin', label: 'Admins' },
    { id: 'suspicious', label: 'Sospechosos' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-primary" />
          Gestión de Usuarios
        </h1>
        
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === tab.id 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${tab.id === 'suspicious' && filter === tab.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
              {tab.id === 'all' ? users.length : 
               tab.id === 'suspicious' ? users.filter(u => u.is_suspicious).length :
               users.filter(u => u.role === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Users className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-medium mb-1">No hay usuarios encontrados</p>
          <p className="text-sm text-gray-500">Prueba cambiando los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Negocios</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!u.is_active ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'admin' && <Shield size={10} />}
                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          
                          {u.is_suspicious && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700" title="Reportado por comportamiento sospechoso">
                              <ShieldAlert size={10} /> Sospechoso
                            </span>
                          )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                        {u.business_count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => toggle(u.id)} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ml-auto
                          ${u.is_active 
                            ? 'border-red-200 text-red-600 hover:bg-red-50' 
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}>
                        {u.is_active ? <><UserX size={14} /> Banear</> : <><UserCheck size={14} /> Activar</>}
                      </button>
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
