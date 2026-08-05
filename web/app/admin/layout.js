'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LayoutDashboard, Store, MessageSquareQuote, Users, FileText, Settings, ArrowLeft, LogOut, Newspaper } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/emprendimientos', label: 'Emprendimientos', icon: Store },
  { to: '/admin/resenas', label: 'Reseñas', icon: MessageSquareQuote },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { to: '/admin/legal', label: 'Textos legales', icon: FileText },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const isActive = (to, exact) => (exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`));

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      <aside className="w-64 flex flex-col shadow-lg z-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="p-6 border-b border-white/10 flex flex-col gap-2 relative z-10">
          <Link href="/admin" className="flex items-center gap-1.5" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Recomiendo</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF', background: '#fff', padding: '1px 8px', borderRadius: '6px', fontFamily: 'Outfit' }}>Pymes</span>
          </Link>
          <span className="text-xs font-medium text-blue-200 tracking-wider uppercase">Panel de Administración</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active ? 'bg-white/15 text-white font-semibold shadow-inner' : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} strokeWidth={2.5} className="opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3 relative z-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-blue-200/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft size={16} />
            Ver sitio público
          </Link>
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
              <span className="text-xs text-blue-300 truncate">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-blue-200 hover:text-red-300 hover:bg-red-400/20 rounded-md transition-colors" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
