import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  Globe, Mail, MessageCircle, MapPin, ExternalLink, Zap, Star,
} from 'lucide-react';
import { getBusiness } from '@/lib/api';
import ReviewItem from '@/components/business/ReviewItem';

const DEFAULT_DESC = 'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.';

const SOCIAL_ICONS = {
  instagram: { label: 'Instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', icon: Instagram },
  facebook: { label: 'Facebook', color: 'bg-[#1877F2]', icon: Facebook },
  tiktok: { label: 'TikTok', color: 'bg-black', icon: Globe },
  whatsapp: { label: 'WhatsApp', color: 'bg-[#25D366]', icon: MessageCircle },
  website: { label: 'Sitio web', color: 'bg-gray-700', icon: Globe },
  youtube: { label: 'YouTube', color: 'bg-[#FF0000]', icon: Youtube },
  linkedin: { label: 'LinkedIn', color: 'bg-[#0A66C2]', icon: Linkedin },
  twitter: { label: 'Twitter/X', color: 'bg-black', icon: Twitter },
  email: { label: 'Email', color: 'bg-indigo-500', icon: Mail },
};

const TYPE_LABELS = { online: 'Digital', physical: 'Físico', both: 'Físico y Digital' };
const TYPE_ICONS = { online: '🌐', physical: '🏪', both: '🏪🌐' };

function formatLocationStr(locStr, city) {
  if (!locStr) return '';
  const parts = locStr.split(',').map((p) => p.trim());
  if (parts.length >= 3) return `${parts.slice(0, 3).join(', ')}, ${city}`;
  return locStr;
}

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

  const socialLinks = Object.entries(business.social_links || {}).filter(([, v]) => v);
  const cleanLocationString = business.location ? formatLocationStr(business.location, business.city) : '';
  const mapLink = business.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${business.coordinates.lat},${business.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location || business.city)}`;

  // JSON-LD LocalBusiness — ahora CON geo coordinates (SE-4) + address + aggregateRating.
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

  const hasOffer = business.active_offer && new Date(business.active_offer.expires_at) > new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* JSON-LD para rich results (id="json-ld" para paridad con el SPA y la malla e2e) */}
      <script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1.5 w-fit">
        ← Volver al catálogo
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Imagen principal */}
        <div className="relative h-64 sm:h-80 bg-gray-100">
          {business.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl text-gray-300">{business.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {business.featured && (
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">
                  ✨ Destacado
                </span>
              )}
              {business.is_verified && (
                <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
                  ✓ Verificado
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-1">{business.name}</h1>
            <p className="text-base sm:text-lg text-gray-100 drop-shadow">{business.category} · {business.city}</p>
          </div>
        </div>

        {hasOffer && (
          <div className="bg-orange-50 border-b border-orange-100 p-4 sm:p-5 flex items-start gap-3">
            <Zap className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900 text-lg">
                🔥 Oferta: {business.active_offer.title}{' '}
                <span className="bg-orange-200 text-orange-900 text-xs px-2 py-0.5 rounded-md ml-1">
                  {business.active_offer.discount} dto
                </span>
              </p>
              {business.active_offer.description && (
                <p className="text-sm text-orange-800 mt-1">{business.active_offer.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Rating + info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-sm sm:text-base text-gray-600">
            {business.rating > 0 ? (
              <span className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full text-yellow-800 font-medium border border-yellow-100">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                <strong>{business.rating.toFixed(1)}</strong>
                <span className="text-yellow-700/70">
                  ({business.review_count} reseña{business.review_count !== 1 ? 's' : ''})
                </span>
              </span>
            ) : (
              <span className="text-gray-400 bg-gray-50 px-3 py-1 rounded-full text-sm">Sin reseñas aún</span>
            )}

            <span className="flex items-center gap-1.5">
              <span>{TYPE_ICONS[business.business_type] || '📦'}</span>
              <span className="font-medium text-gray-700">{TYPE_LABELS[business.business_type] || business.business_type}</span>
            </span>

            {business.established && (
              <span className="font-medium text-gray-700">📅 Desde {business.established}</span>
            )}
          </div>

          <div className="prose max-w-none mb-8 text-gray-700 leading-relaxed">
            <p>{business.description}</p>
          </div>

          {/* Ubicación & entregas */}
          <div className="grid sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</span>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{business.city}</p>
                  {cleanLocationString && <p className="text-sm text-gray-600 mt-0.5">{cleanLocationString}</p>}
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
                  >
                    Ver en el mapa <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {business.delivery_methods?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entregas</span>
                <ul className="flex flex-col gap-2 text-sm text-gray-700">
                  {business.delivery_methods.includes('home_delivery') && <li className="flex items-center gap-2">🏠 Envío a domicilio</li>}
                  {business.delivery_methods.includes('store_pickup') && <li className="flex items-center gap-2">🏪 Retiro en tienda</li>}
                  {business.delivery_methods.includes('meeting_point') && <li className="flex items-center gap-2">🤝 Puntos de encuentro</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Redes sociales / contacto */}
          {socialLinks.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Contacto</h2>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map(([key, url]) => {
                  const info = SOCIAL_ICONS[key] || { label: key, color: 'bg-gray-600', icon: ExternalLink };
                  const Icon = info.icon;
                  let href = url;
                  if (key === 'whatsapp') {
                    href = `https://wa.me/${url.replace(/[^0-9]/g, '')}?text=Hola,%20vi%20tu%20negocio%20${encodeURIComponent(business.name)}%20en%20RecomiendoPymes!`;
                  } else if (key === 'email') {
                    href = `mailto:${url}`;
                  } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
                    href = `https://${href}`;
                  }
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${info.color} text-white text-sm font-medium px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-transform shadow-sm`}
                    >
                      <Icon size={16} />
                      {info.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galería */}
      {business.gallery?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Galería</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {business.gallery.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                alt={`${business.name} ${i + 1}`}
                className="aspect-square w-full object-cover rounded-xl shadow-sm border border-gray-100"
              />
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span>
            Reseñas {reviews.length > 0 && <span className="text-gray-400 font-medium ml-1">({reviews.length})</span>}
          </span>
        </h2>
        <div className="space-y-4 mb-8">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Aún no hay reseñas. ¡Sé el primero en calificar tu experiencia!
            </p>
          ) : (
            reviews.map((r) => <ReviewItem key={r._id || r.id} review={r} />)
          )}
        </div>

        {/* Fase 2: sin sesión aún. El formulario para dejar reseña llega en la Fase 3. */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center text-sm text-gray-500">
          Para dejar una reseña necesitas iniciar sesión. (Disponible próximamente en esta versión.)
        </div>
      </section>
    </div>
  );
}
