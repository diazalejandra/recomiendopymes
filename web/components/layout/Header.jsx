'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { shouldHideChrome } from '@/components/layout/chrome';

// Header con estado de sesión real (portado desde AppLayout del SPA).
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auth y admin van sin el header público (pantalla completa / sidebar propio).
  if (shouldHideChrome(pathname)) return null;

  const navLinks = [
    { href: '/', label: 'Catálogo' },
    { href: '/mapa', label: 'Mapa' },
    { href: '/inscribir', label: 'Inscribir negocio' },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <header
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--ink)' }}>Recomiendo</span>
            <span className="text-lg font-bold tracking-tight px-1.5 py-0.5 rounded-md" style={{ background: 'var(--brand)', color: '#fff' }}>Pymes</span>
          </Link>

          {/* Nav central — desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Acciones derecha */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ color: 'var(--brand)', background: 'var(--brand-light)' }}>
                    Admin
                  </Link>
                ) : (
                  <Link
                    href="/mi-negocio"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                  >
                    Mis negocios
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                >
                  Ingresar
                </Link>
                <Link
                  href="/inscribir"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity"
                  style={{ background: 'var(--brand)', color: '#fff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--brand)')}
                >
                  Agregar negocio
                </Link>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen((o) => !o)} style={{ color: 'var(--ink)' }} aria-label="Menú">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="block px-3 py-2.5 text-sm font-medium" style={{ color: 'var(--brand)' }} onClick={() => setMobileOpen(false)}>
                    Admin
                  </Link>
                ) : (
                  <Link href="/mi-negocio" className="block px-3 py-2.5 text-sm font-medium" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>
                    Mis negocios
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm" style={{ color: 'var(--muted)' }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold mt-1"
                style={{ background: 'var(--brand)', color: '#fff' }}
                onClick={() => setMobileOpen(false)}
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
