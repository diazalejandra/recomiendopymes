import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { 
  Instagram, Facebook, Twitter, Linkedin, Youtube, 
  Globe, Mail, MessageCircle, MapPin, ExternalLink, Zap, Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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

const DEFAULT_TITLE = 'RecomiendoPymes — Catálogo de Emprendedores Chilenos';
const DEFAULT_DESC = 'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.';

// Limpia el texto de ubicación pero mantiene información útil
const formatLocationStr = (locStr, city) => {
  if (!locStr) return '';
  const parts = locStr.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    return `${parts.slice(0, 3).join(', ')}, ${city}`;
  }
  return locStr;
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

      // JSON-LD LocalBusiness
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: data.business.name,
        description: data.business.description,
        image: data.business.image,
        ...(data.business.location ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.business.city,
            addressCountry: 'CL',
          }
        } : {}),
        ...(data.business.review_count > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: data.business.rating,
            reviewCount: data.business.review_count,
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
    };
  }, [slug]);

  const isOwner = user && business?.owner_user_id &&
    String(business.owner_user_id) === String(user.id);

  const handleReviewAdded = (review) => {
    setReviews(prev => [review, ...prev]);
    // Actualizar datos del negocio para refrescar rating y contador
    businessApi.get(slug).then(data => setBusiness(data.business)).catch(() => {});
  };
  const handleResponseAdded = (updated) =>
    setReviews(prev => prev.map(r => (r._id || r.id) === (updated._id || updated.id) ? updated : r));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emprendimiento no encontrado</h2>
        <Link to="/" className="text-blue-600 hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const socialLinks = Object.entries(business.social_links || {}).filter(([, v]) => v);
  const cleanLocationString = business.location ? formatLocationStr(business.location, business.city) : '';
  const mapLink = business.coordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${business.coordinates.lat},${business.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location || business.city)}`;

  const pageUrl = `https://recomiendopymes.cl/emprendimiento/${business.slug}`;
  const desc = business.description?.slice(0, 160) || DEFAULT_DESC;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`${business.name} — ${business.category} en ${business.city} | RecomiendoPymes`}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={`${business.name} | RecomiendoPymes`} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={business.image || ''} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:title" content={`${business.name} | RecomiendoPymes`} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={business.image || ''} />
      </Helmet>

      <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1.5 w-fit">
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

        {business.active_offer && new Date(business.active_offer.expires_at) > new Date() && (
          <div className="bg-orange-50 border-b border-orange-100 p-4 sm:p-5 flex items-start gap-3">
            <Zap className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900 text-lg">🔥 Oferta: {business.active_offer.title} <span className="bg-orange-200 text-orange-900 text-xs px-2 py-0.5 rounded-md ml-1">{business.active_offer.discount} dto</span></p>
              {business.active_offer.description && <p className="text-sm text-orange-800 mt-1">{business.active_offer.description}</p>}
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
                <span className="text-yellow-700/70">({business.review_count} reseña{business.review_count !== 1 ? 's' : ''})</span>
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

          {/* Delivery & Ubicacion Section */}
          <div className="grid sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</span>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{business.city}</p>
                  {cleanLocationString && <p className="text-sm text-gray-600 mt-0.5">{cleanLocationString}</p>}
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1">
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

          {/* Redes sociales */}
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
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${info.color} text-white text-sm font-medium px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-transform shadow-sm`}>
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
              <img key={i} src={img} alt={`${business.name} ${i + 1}`}
                className="aspect-square w-full object-cover rounded-xl shadow-sm border border-gray-100" />
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span>Reseñas {reviews.length > 0 && <span className="text-gray-400 font-medium ml-1">({reviews.length})</span>}</span>
        </h2>
        <div className="space-y-4 mb-8">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Aún no hay reseñas. ¡Sé el primero en calificar tu experiencia!
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <ReviewForm businessId={business.id} onReviewAdded={handleReviewAdded} />
          </div>
        )}
      </section>
    </div>
  );
}
