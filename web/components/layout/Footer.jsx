'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { shouldHideChrome } from '@/components/layout/chrome';

// Portado desde frontend/src/components/AppLayout.jsx (footer).
const RESOURCES = [
  { label: 'Sercotec', href: 'https://www.sercotec.cl' },
  { label: 'SII', href: 'https://www.sii.cl' },
  { label: 'Sernac', href: 'https://www.sernac.cl' },
  { label: 'ChileAtiende', href: 'https://www.chileatiende.gob.cl' },
  { label: 'CORFO', href: 'https://www.corfo.cl' },
  { label: 'ProChile', href: 'https://www.prochile.gob.cl' },
];

export default function Footer() {
  const pathname = usePathname();
  if (shouldHideChrome(pathname)) return null;
  const isHome = pathname === '/';

  return (
    <footer
      style={{ borderTop: isHome ? 'none' : '1px solid var(--border)', background: 'var(--surface)' }}
      className={isHome ? '' : 'mt-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recursos para emprendedores */}
        <div className="py-8 border-b flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Recursos para emprendedores
          </p>
          <div className="flex flex-wrap gap-3">
            {RESOURCES.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--bg)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand)';
                  e.currentTarget.style.color = 'var(--brand)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                {label} ↗
              </a>
            ))}
          </div>
        </div>

        {/* Links y crédito */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Recomiendo</span>
            <span className="font-bold text-sm px-1.5 py-0.5 rounded" style={{ background: 'var(--brand)', color: '#fff' }}>
              Pymes
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/terminos"
              className="text-xs transition-colors"
              style={{ color: 'var(--subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--subtle)')}
            >
              Términos
            </Link>
            <Link
              href="/privacidad"
              className="text-xs transition-colors"
              style={{ color: 'var(--subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--subtle)')}
            >
              Privacidad
            </Link>
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
              © {new Date().getFullYear()} · Hecho en Chile
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://flagcdn.com/w20/cl.png"
                srcSet="https://flagcdn.com/w40/cl.png 2x"
                width="14"
                alt="Chile"
                className="inline-block opacity-90"
              />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
