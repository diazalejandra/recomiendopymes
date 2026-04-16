import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

const SOCIAL_ICONS = {
  instagram: { label: 'Instagram', color: 'bg-pink-500' },
  facebook: { label: 'Facebook', color: 'bg-blue-600' },
  tiktok: { label: 'TikTok', color: 'bg-gray-900' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-500' },
  website: { label: 'Sitio web', color: 'bg-gray-600' },
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-700' },
  twitter: { label: 'Twitter/X', color: 'bg-gray-900' },
  email: { label: 'Email', color: 'bg-indigo-500' },
};

const TYPE_LABELS = {
  online: 'Digital',
  physical: 'Físico',
  both: 'Físico y Digital',
};

const TYPE_ICONS = {
  online: '🌐',
  physical: '🏪',
  both: '🏪🌐',
};

export default function BusinessDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessApi.get(slug).then(data => {
      setBusiness(data.business);
      setReviews(data.reviews || []);

      // SEO dinámico
      const b = data.business;
      document.title = `${b.name} — ${b.category} en ${b.city} | RecomiendoPymes`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', b.description?.slice(0, 160) || '');

      // JSON-LD LocalBusiness
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: b.name,
        description: b.description,
        image: b.image,
        ...(b.location ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: b.city,
            addressCountry: 'CL',
          }
        } : {}),
        ...(b.review_count > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: b.rating,
            reviewCount: b.review_count,
          }
        } : {}),
      };
      let ld = document.getElementById('json-ld');
      if (!ld) {
        ld = document.createElement('script');
        ld.id = 'json-ld';
        ld.type = 'application/ld+json';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(schema);
    }).catch(() => {
      setBusiness(null);
    }).finally(() => setLoading(false));

    return () => {
      document.getElementById('json-ld')?.remove();
      document.title = 'RecomiendoPymes — Catálogo de emprendedores chilenos';
    };
  }, [slug]);

  const isOwner = user && business?.owner_user_id &&
    String(business.owner_user_id) === String(user.id);

  const handleReviewAdded = (review) => setReviews(prev => [review, ...prev]);
  const handleResponseAdded = (updated) =>
    setReviews(prev => prev.map(r => (r._id || r.id) === (updated._id || updated.id) ? updated : r));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emprendimiento no encontrado</h2>
        <Link to="/" className="text-primary hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const socialLinks = Object.entries(business.social_links || {}).filter(([, v]) => v);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-primary mb-6 inline-block">
        ← Volver al catálogo
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Imagen principal */}
        <div className="relative h-64 sm:h-80 bg-gray-100">
          {business.image ? (
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl text-gray-300">{business.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {business.featured && (
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                  ✨ Destacado
                </span>
              )}
              {business.is_verified && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                  ✓ Verificado
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{business.name}</h1>
            <p className="text-sm opacity-80">{business.category} · {business.city}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Rating + info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
            {business.rating > 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <strong className="text-gray-900">{business.rating.toFixed(1)}</strong>
                <span>({business.review_count} reseña{business.review_count !== 1 ? 's' : ''})</span>
              </span>
            ) : (
              <span className="text-gray-400">Sin reseñas aún</span>
            )}
            <span>📍 {business.city}{business.location ? `, ${business.location}` : ''}</span>
            <span>{TYPE_ICONS[business.business_type] || '📦'} {TYPE_LABELS[business.business_type] || business.business_type}</span>
            {business.established && <span>📅 Desde {business.established}</span>}
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{business.description}</p>

          {/* Redes sociales */}
          {socialLinks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Contáctame</h2>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(([key, url]) => {
                  const info = SOCIAL_ICONS[key] || { label: key, color: 'bg-gray-500' };
                  const href = key === 'whatsapp'
                    ? `https://wa.me/${url}`
                    : key === 'email'
                    ? `mailto:${url}`
                    : url;
                  return (
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 ${info.color} text-white text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Galería</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {business.gallery.map((img, i) => (
              <img key={i} src={img} alt={`${business.name} ${i + 1}`}
                className="aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Reseñas {reviews.length > 0 && (
            <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
          )}
        </h2>
        <div className="space-y-3 mb-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Aún no hay reseñas. ¡Sé el primero!
            </p>
          ) : (
            reviews.map(r => (
              <ReviewItem
                key={r._id || r.id}
                review={r}
                isOwner={isOwner}
                onResponseAdded={handleResponseAdded}
              />
            ))
          )}
        </div>
        {!isOwner && (
          <ReviewForm businessId={business.id} onReviewAdded={handleReviewAdded} />
        )}
      </section>
    </div>
  );
}
