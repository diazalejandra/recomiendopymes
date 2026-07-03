import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveCategory, resolveCity } from '@/lib/slug';
import { getBusinesses } from '@/lib/api';
import CatalogGrid from '@/components/catalog/CatalogGrid';

export async function generateMetadata({ params }) {
  const { cat, ciudad } = await params;
  const [category, city] = await Promise.all([resolveCategory(cat), resolveCity(ciudad)]);
  if (!category || !city) return { title: 'Página no encontrada' };
  return {
    title: `${category} en ${city}`,
    description: `Emprendimientos de ${category} en ${city}, Chile. Descubre y apoya micro-emprendimientos locales.`,
    alternates: { canonical: `/categoria/${cat}/${ciudad}` },
  };
}

export default async function CategoryCityPage({ params, searchParams }) {
  const { cat, ciudad } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const [category, city] = await Promise.all([resolveCategory(cat), resolveCity(ciudad)]);
  if (!category || !city) notFound();

  const data = await getBusinesses({ category, city, page, limit: 12 });
  const businesses = data?.businesses || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const pageHref = (n) => (n > 1 ? `/categoria/${cat}/${ciudad}?page=${n}` : `/categoria/${cat}/${ciudad}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        <Link href="/" className="hover:underline">Catálogo</Link> <span className="mx-1">/</span>
        <Link href={`/categoria/${cat}`} className="hover:underline">{category}</Link> <span className="mx-1">/</span> {city}
      </nav>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
        {category} en {city}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> emprendimiento{total !== 1 ? 's' : ''} en {city}
      </p>

      <CatalogGrid
        businesses={businesses}
        page={page}
        totalPages={totalPages}
        pageHref={pageHref}
        emptyMessage={`Aún no hay emprendimientos de ${category} en ${city}.`}
      />
    </div>
  );
}
