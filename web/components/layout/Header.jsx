'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Portado desde frontend/src/components/AppLayout.jsx (header).
// NOTA (Fase 1): el estado de sesión aún NO está cableado en Next — se muestra el
// estado "no autenticado". El AuthProvider + acciones (Mis negocios / Admin / Salir)
// se portan en la Fase 3 (páginas privadas). Aquí solo montamos el shell.
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Catálogo' },
    { href: '/mapa', label: 'Mapa' },
    { href: '/inscribir', label: 'Inscribir negocio' },
  ];

  return (
    <header
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              Recomiendo
            </span>
            <span
              className="text-lg font-bold tracking-tight px-1.5 py-0.5 rounded-md"
              style={{ background: 'var(--brand)', color: '#fff' }}
            >
              Pymes
            </span>
          </Link>

          {/* Nav central — desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg)';
                  e.currentTarget.style.color = 'var(--ink)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Acciones derecha (estado no autenticado — Fase 1) */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
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
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen((o) => !o)}
            style={{ color: 'var(--ink)' }}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: 'var(--ink)' }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold mt-1"
              style={{ background: 'var(--brand)', color: '#fff' }}
              onClick={() => setMobileOpen(false)}
            >
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
