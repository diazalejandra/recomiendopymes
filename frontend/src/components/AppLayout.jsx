import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function AppLayout({ children, hideFooter = false }) {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-8">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 flex-shrink-0">
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                Recomiendo
              </span>
              <span className="text-lg font-bold tracking-tight px-1.5 py-0.5 rounded-md"
                style={{ background: 'var(--brand)', color: '#fff' }}>
                Pymes
              </span>
            </Link>

            {/* Nav central — desktop */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <Link to="/" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--muted)'; }}>
                Catálogo
              </Link>
              <Link to="/mapa" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--muted)'; }}>
                Mapa
              </Link>
              <Link to="/inscribir" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--muted)'; }}>
                Inscribir negocio
              </Link>
            </nav>

            {/* Acciones derecha */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ color: 'var(--brand)', background: 'var(--brand-light)' }}>
                      Admin
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/mi-negocio"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{ color: 'var(--muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                      Mis negocios
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                    Ingresar
                  </Link>
                  <Link to="/inscribir"
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity"
                    style={{ background: 'var(--brand)', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}>
                    Agregar negocio
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger mobile */}
            <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(o => !o)}
              style={{ color: 'var(--ink)' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {[
              { href: '/', label: 'Catálogo' },
              { href: '/mapa', label: 'Mapa' },
              { href: '/inscribir', label: 'Inscribir negocio' },
            ].map(({ href, label }) => (
              <Link key={href} to={href}
                className="px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: 'var(--ink)' }}
                onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
              {isLoggedIn ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm"
                  style={{ color: 'var(--muted)' }}>
                  Cerrar sesión
                </button>
              ) : (
                <Link to="/login"
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold mt-1"
                  style={{ background: 'var(--brand)', color: '#fff' }}
                  onClick={() => setMobileOpen(false)}>
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      {!hideFooter && (
      <footer style={{ borderTop: location.pathname === '/' ? 'none' : '1px solid var(--border)', background: 'var(--surface)' }}
        className={location.pathname === '/' ? '' : 'mt-20'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Recursos para emprendedores */}
          <div className="py-8 border-b flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Recursos para emprendedores
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Sercotec', href: 'https://www.sercotec.cl' },
                { label: 'SII', href: 'https://www.sii.cl' },
                { label: 'Sernac', href: 'https://www.sernac.cl' },
                { label: 'ChileAtiende', href: 'https://www.chileatiende.gob.cl' },
                { label: 'CORFO', href: 'https://www.corfo.cl' },
                { label: 'ProChile', href: 'https://www.prochile.gob.cl' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--bg)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Links y crédito */}
          <div className="py-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Recomiendo</span>
              <span className="font-bold text-sm px-1.5 py-0.5 rounded"
                style={{ background: 'var(--brand)', color: '#fff' }}>Pymes</span>
            </div>
            <div className="flex items-center gap-5">
              <Link to="/terminos" className="text-xs transition-colors"
                style={{ color: 'var(--subtle)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--subtle)'}>
                Términos
              </Link>
              <Link to="/privacidad" className="text-xs transition-colors"
                style={{ color: 'var(--subtle)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--subtle)'}>
                Privacidad
              </Link>
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                © {new Date().getFullYear()} · Hecho en Chile 🇨🇱
              </span>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
