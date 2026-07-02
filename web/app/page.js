import Link from 'next/link';
import { MapPin, X, LayoutGrid, List } from 'lucide-react';
import { getBusinesses, getCategories, getCities } from '@/lib/api';
import BusinessCard from '@/components/catalog/BusinessCard';
import CatalogSearch from '@/components/catalog/CatalogSearch';

// El home lee los filtros de la URL y renderiza el catálogo en el servidor (indexable).
// Cada filtro es un <Link> → una URL server-rendered distinta. Solo el buscador del hero
// es client. Vista de mapa y franja de noticias: diferidas (Fase 3 / migración de noticias).
export const metadata = {
  // Las vistas filtradas por query param canonicalizan a la base (evita duplicados, RN-6/SE-5).
  alternates: { canonical: '/' },
};

const CAT_ICONS = {
  'Alimentación y Bebidas': '🍽️',
  'Artesanías y Manualidades': '🎨',
  'Belleza y Cuidado Personal': '💄',
  'Clothing y Moda': '👗',
  'Consultoría y Servicios Profesionales': '💼',
  'Deporte y Vida Saludable': '🏋️',
  'Educación y Formación': '📚',
  'Electrónica y Tecnología': '💻',
  'Fotografía y Diseño': '📸',
  'Hogar y Decoración': '🏠',
  'Jardinería y Plantas': '🌱',
  'Mascotas': '🐾',
};

function href(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `/?${s}` : '/';
}

// Link de control del catálogo: cambia la URL PERO sin saltar al top (scroll={false}),
// para que filtrar/paginar/cambiar vista se sienta fluido (no reinicia el scroll).
function NavLink(props) {
  return <Link scroll={false} {...props} />;
}

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const search = sp.search || '';
  const city = sp.city || '';
  const category = sp.category || '';
  const view = sp.view === 'list' ? 'list' : 'grid';
  const nationwide = sp.nationwide === 'true';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const [data, categories, cities] = await Promise.all([
    getBusinesses({ search, city, category, page, nationwide, limit: 12 }),
    getCategories(),
    getCities(),
  ]);

  const businesses = data?.businesses || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;
  const hasFilters = Boolean(search || city || category);
  const topCats = (categories || []).slice(0, 8);

  const base = {
    search,
    city,
    category,
    view: view === 'list' ? 'list' : '',
    nationwide: nationwide ? 'true' : '',
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ════════ HERO ════════ */}
      <section
        className="relative px-4 pt-14 pb-12 sm:pt-20 sm:pb-16"
        style={{
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, var(--bg) 100%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', opacity: 0.08, pointerEvents: 'none', transform: 'rotate(15deg)' }}>
          <MapPin size={450} strokeWidth={1.5} color="var(--brand)" />
        </div>
        <div style={{ position: 'absolute', bottom: '20px', left: '-50px', opacity: 0.06, pointerEvents: 'none', transform: 'rotate(-20deg)' }}>
          <MapPin size={250} strokeWidth={1.5} color="var(--brand)" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold mb-6 shadow-sm"
            style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-mid)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://flagcdn.com/16x12/cl.png" alt="Chile" width="16" height="12" style={{ display: 'inline', verticalAlign: 'middle' }} />
            Directorio de Emprendedores Chilenos
          </div>

          <h1 className="mb-4" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--ink)' }}>
            Encuentra emprendedores<br />
            <span style={{ color: 'var(--brand)' }}>cerca de ti</span>
          </h1>

          <p className="mb-8" style={{ color: '#475569', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            El catálogo más completo de micro y pequeñas empresas de Chile.
          </p>

          <CatalogSearch cities={cities} initialSearch={search} initialCity={city} />

          {/* Categorías rápidas (Links server-rendered) */}
          <div className="flex flex-wrap justify-center gap-2 px-2">
            {topCats.map((cat) => {
              const active = category === cat;
              return (
                <NavLink
                  key={cat}
                  href={active ? href({ ...base, category: '' }) : href({ ...base, category: cat })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
                  style={{
                    background: active ? 'var(--brand)' : 'var(--surface)',
                    color: active ? '#fff' : 'var(--ink)',
                    borderColor: active ? 'var(--brand)' : 'var(--border)',
                  }}
                >
                  <span>{CAT_ICONS[cat] || '📦'}</span>
                  {cat.split(' y ')[0].split(' de ')[0]}
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ CATÁLOGO ════════ */}
      <div style={{ flex: 1 }}>
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {category ? (
                  <>
                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> resultado{total !== 1 ? 's' : ''} en{' '}
                    <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{category}</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> emprendimiento{total !== 1 ? 's' : ''}
                    {city ? ` en ${city}` : ''}
                  </>
                )}
              </p>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {search && (
                  <NavLink href={href({ ...base, search: '' })} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    &quot;{search}&quot; <X size={12} />
                  </NavLink>
                )}
                {city && (
                  <NavLink href={href({ ...base, city: '' })} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    📍 {city} <X size={12} />
                  </NavLink>
                )}
                {category && (
                  <NavLink href={href({ ...base, category: '' })} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    {CAT_ICONS[category]} {category} <X size={12} />
                  </NavLink>
                )}
                <NavLink href="/" className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  Limpiar todo
                </NavLink>
                <NavLink
                  href={href({ ...base, nationwide: nationwide ? '' : 'true' })}
                  className="flex items-center gap-1.5 px-3 py-1 ml-2 rounded-full border text-xs font-medium"
                  style={{
                    borderColor: nationwide ? 'var(--brand)' : 'var(--border)',
                    background: nationwide ? 'var(--brand-light)' : 'var(--surface)',
                    color: nationwide ? 'var(--brand)' : 'var(--ink)',
                  }}
                >
                  {nationwide ? '☑' : '☐'} Incluir envíos nacionales
                </NavLink>
              </div>
            )}

            {/* View toggle */}
            <div className="flex items-center rounded-lg overflow-hidden ml-auto flex-shrink-0" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <NavLink
                href={href({ ...base, view: '' })}
                title="Cuadrícula"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                style={{ background: view === 'grid' ? 'var(--brand)' : 'transparent', color: view === 'grid' ? '#fff' : 'var(--muted)', borderRight: '1px solid var(--border)' }}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cuadrícula</span>
              </NavLink>
              <NavLink
                href={href({ ...base, view: 'list' })}
                title="Lista"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                style={{ background: view === 'list' ? 'var(--brand)' : 'transparent', color: view === 'list' ? '#fff' : 'var(--muted)' }}
              >
                <List size={14} />
                <span className="hidden sm:inline">Lista</span>
              </NavLink>
            </div>
          </div>

          {/* Resultados */}
          {businesses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>Sin resultados</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Prueba con otros filtros o limpia la búsqueda.</p>
              <NavLink href="/" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>Limpiar filtros</NavLink>
            </div>
          ) : (
            <>
              {view === 'list' ? (
                <div className="flex flex-col gap-2">
                  {businesses.map((b) => <BusinessCard key={b.id} business={b} viewMode="list" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {businesses.map((b) => <BusinessCard key={b.id} business={b} viewMode="grid" />)}
                </div>
              )}

              {/* Paginación (Links) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <NavLink href={href({ ...base, page: page - 1 })} className="px-3 py-1.5 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
                      ← Anterior
                    </NavLink>
                  )}
                  <span className="text-sm px-2" style={{ color: 'var(--muted)' }}>Página {page} de {totalPages}</span>
                  {page < totalPages && (
                    <NavLink href={href({ ...base, page: page + 1 })} className="px-3 py-1.5 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
                      Siguiente →
                    </NavLink>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
