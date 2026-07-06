import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveCategory, toSlug } from '@/lib/slug';
import { getBusinesses } from '@/lib/api';
import CatalogGrid from '@/components/catalog/CatalogGrid';

export async function generateMetadata({ params }) {
  const { cat } = await params;
  const category = await resolveCategory(cat);
  if (!category) return { title: 'Categoría no encontrada' };
  return {
    title: `${category} en Chile`,
    description: `Descubre emprendimientos de ${category} en Chile. Directorio de micro y pequeñas empresas chilenas.`,
    alternates: { canonical: `/categoria/${cat}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { cat } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const category = await resolveCategory(cat);
  if (!category) notFound();

  // Grid paginado + un fetch amplio para derivar las ciudades presentes (enlaces internos).
  const [data, allInCat] = await Promise.all([
    getBusinesses({ category, page, limit: 12 }),
    getBusinesses({ category, limit: 500 }),
  ]);

  const businesses = data?.businesses || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const cities = Array.from(new Set((allInCat?.businesses || []).map((b) => b.city).filter(Boolean))).sort();

  const pageHref = (n) => (n > 1 ? `/categoria/${cat}?page=${n}` : `/categoria/${cat}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        <Link href="/" className="hover:underline">Catálogo</Link> <span className="mx-1">/</span> {category}
      </nav>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
        {category} en Chile
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> emprendimiento{total !== 1 ? 's' : ''}
      </p>

      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-xs self-center" style={{ color: 'var(--muted)' }}>Por ciudad:</span>
          {cities.map((c) => (
            <Link
              key={c}
              href={`/categoria/${cat}/${toSlug(c)}`}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface)' }}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <CatalogGrid
        businesses={businesses}
        page={page}
        totalPages={totalPages}
        pageHref={pageHref}
        emptyMessage={`Aún no hay emprendimientos de ${category}.`}
      />
    </div>
  );
}
