import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBusiness } from '@/lib/api';
import BusinessDetailView from '@/components/business/BusinessDetailView';

const DEFAULT_DESC = 'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBusiness(slug);
  if (!data?.business) return { title: 'Emprendimiento no encontrado' };

  const b = data.business;
  const desc = (b.description || DEFAULT_DESC).slice(0, 160);
  const pageUrl = `/emprendimiento/${b.slug}`;
  const ogTitle = `${b.name} | RecomiendoPymes`;

  return {
    title: `${b.name} — ${b.category} en ${b.city}`,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: ogTitle,
      description: desc,
      url: pageUrl,
      type: 'website',
      images: b.image ? [b.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: desc,
      images: b.image ? [b.image] : undefined,
    },
  };
}

export default async function BusinessDetailPage({ params }) {
  const { slug } = await params;
  const data = await getBusiness(slug);
  if (!data?.business) notFound();

  const business = data.business;
  const reviews = data.reviews || [];

  // JSON-LD LocalBusiness — con geo (SE-4) + address + aggregateRating.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    ...(business.image ? { image: business.image } : {}),
    ...(business.location
      ? { address: { '@type': 'PostalAddress', addressLocality: business.city, addressCountry: 'CL' } }
      : {}),
    ...(business.coordinates
      ? { geo: { '@type': 'GeoCoordinates', latitude: business.coordinates.lat, longitude: business.coordinates.lng } }
      : {}),
    ...(business.review_count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: business.rating, reviewCount: business.review_count } }
      : {}),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* JSON-LD para rich results (id="json-ld" para paridad con el SPA y la malla e2e) */}
      <script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1.5 w-fit">
        ← Volver al catálogo
      </Link>

      <BusinessDetailView business={business} reviews={reviews} />
    </div>
  );
}
