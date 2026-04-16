import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Store, 
  MessageSquareQuote, 
  Users, 
  FileText, 
  Settings,
  ArrowLeft,
  LogOut,
  Newspaper
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/emprendimientos', label: 'Emprendimientos', icon: Store },
  { to: '/admin/resenas', label: 'Reseñas', icon: MessageSquareQuote },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { to: '/admin/legal', label: 'Textos legales', icon: FileText },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shadow-lg z-10" style={{ background: 'linear-gradient(180deg, #1E40AF 0%, #1e3a8a 100%)' }}>
        <div className="p-6 border-b border-white/10 flex flex-col gap-2">
          <Link to="/admin" className="flex items-center gap-1.5" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
              Recomiendo
            </span>
            <span style={{
              fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF',
              background: '#fff', padding: '1px 8px', borderRadius: '6px',
              fontFamily: 'Outfit',
            }}>
              Pymes
            </span>
          </Link>
          <span className="text-xs font-medium text-blue-200 tracking-wider uppercase">Panel de Administración</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                  ? 'bg-white/15 text-white font-semibold shadow-inner' 
                  : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                }`
              }>
              <Icon size={18} strokeWidth={2.5} className="opacity-90" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-blue-200/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft size={16} />
            Ver sitio público
          </Link>
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
              <span className="text-xs text-blue-300 truncate">{user?.email}</span>
            </div>
            <button onClick={handleLogout} 
              className="p-1.5 text-blue-200 hover:text-red-300 hover:bg-red-400/20 rounded-md transition-colors"
              title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
