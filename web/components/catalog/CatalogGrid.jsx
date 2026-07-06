import Link from 'next/link';
import BusinessCard from './BusinessCard';

// Grid de negocios + paginación, reutilizable (páginas de categoría/ciudad).
// pageHref(n) construye la URL de la página n; se pasa desde la ruta.
export default function CatalogGrid({ businesses = [], page = 1, totalPages = 1, pageHref, emptyMessage = 'Aún no hay emprendimientos aquí.' }) {
  if (!businesses.length) {
    return (
      <p className="text-center py-16 text-sm rounded-xl border border-dashed" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
        {emptyMessage}
      </p>
    );
  }

  const btn = 'px-4 py-2 rounded-lg text-sm font-medium border transition-all';
  const btnStyle = { borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface)' };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {businesses.map((b) => <BusinessCard key={b.id} business={b} viewMode="grid" />)}
      </div>

      {totalPages > 1 && pageHref && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} scroll={false} className={btn} style={btnStyle}>← Anterior</Link>
          ) : (
            <span className={`${btn} opacity-40 select-none`} style={btnStyle}>← Anterior</span>
          )}
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--muted)' }}>{page} / {totalPages}</span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} scroll={false} className={btn} style={btnStyle}>Siguiente →</Link>
          ) : (
            <span className={`${btn} opacity-40 select-none`} style={btnStyle}>Siguiente →</span>
          )}
        </div>
      )}
    </>
  );
}
