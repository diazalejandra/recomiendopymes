import {
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  Globe, Mail, MessageCircle, MapPin, ExternalLink, Zap, Star,
} from 'lucide-react';
import ReviewsSection from './ReviewsSection';

// Vista visual de la ficha de negocio (card + galería + reseñas). Componente COMPARTIDO
// (sin 'use client'): lo usa el Server Component público (SSR/SEO) y también la
// previsualización autenticada del dueño (client). No incluye JSON-LD ni el back-link:
// eso lo pone cada página según su contexto.

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

export default function BusinessDetailView({ business, reviews = [] }) {
  const socialLinks = Object.entries(business.social_links || {}).filter(([, v]) => v);
  const cleanLocationString = business.location ? formatLocationStr(business.location, business.city) : '';
  const mapLink = business.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${business.coordinates.lat},${business.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location || business.city)}`;
  const hasOffer = business.active_offer && new Date(business.active_offer.expires_at) > new Date();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
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
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">✨ Destacado</span>
              )}
              {business.is_verified && (
                <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">✓ Verificado</span>
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
                <span className="bg-orange-200 text-orange-900 text-xs px-2 py-0.5 rounded-md ml-1">{business.active_offer.discount} dto</span>
              </p>
              {business.active_offer.description && <p className="text-sm text-orange-800 mt-1">{business.active_offer.description}</p>}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
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
            {business.established && <span className="font-medium text-gray-700">📅 Desde {business.established}</span>}
          </div>

          <div className="prose max-w-none mb-8 text-gray-700 leading-relaxed">
            <p>{business.description}</p>
          </div>

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
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${info.color} text-white text-sm font-medium px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-transform shadow-sm`}>
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

      {business.gallery?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Galería</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {business.gallery.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img} alt={`${business.name} ${i + 1}`} className="aspect-square w-full object-cover rounded-xl shadow-sm border border-gray-100" />
            ))}
          </div>
        </section>
      )}

      <ReviewsSection businessId={business.id} ownerUserId={business.owner_user_id} initialReviews={reviews} />
    </>
  );
}
