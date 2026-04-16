import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';

const TYPE_LABELS = {
  online: 'Digital',
  physical: 'Físico',
  both: 'Físico y Digital',
};

// Color por categoría — palette coherente
const CAT_COLORS = {
  'Alimentación y Bebidas':              { bg: '#FEF3C7', text: '#92400E' },
  'Artesanías y Manualidades':           { bg: '#FCE7F3', text: '#9D174D' },
  'Belleza y Cuidado Personal':          { bg: '#FDE8F0', text: '#BE185D' },
  'Clothing y Moda':                     { bg: '#EDE9FE', text: '#5B21B6' },
  'Consultoría y Servicios Profesionales': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Deporte y Vida Saludable':            { bg: '#D1FAE5', text: '#065F46' },
  'Educación y Formación':               { bg: '#E0F2FE', text: '#0369A1' },
  'Electrónica y Tecnología':            { bg: '#F0FDF4', text: '#166534' },
  'Fotografía y Diseño':                 { bg: '#FEF9C3', text: '#713F12' },
  'Hogar y Decoración':                  { bg: '#FFF7ED', text: '#9A3412' },
  'Jardinería y Plantas':                { bg: '#ECFDF5', text: '#047857' },
  'Mascotas':                            { bg: '#FDF2F8', text: '#A21CAF' },
};

function getCatStyle(cat) {
  return CAT_COLORS[cat] || { bg: 'var(--brand-light)', text: 'var(--brand)' };
}

function isNew(activatedAt) {
  if (!activatedAt) return false;
  return (Date.now() - new Date(activatedAt).getTime()) / 86400000 <= 30;
}

/* ── Lista (horizontal compact) ── */
function ListCard({ business }) {
  const cs = getCatStyle(business.category);
  return (
    <Link to={`/emprendimiento/${business.slug}`} className="group block">
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-light)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}>

        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={business.image || `https://placehold.co/128x128/EFF6FF/2563EB?text=${encodeURIComponent(business.name[0])}`}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cs.bg, color: cs.text }}>
              {business.category}
            </span>
            {business.is_verified && (
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            )}
          </div>
          <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors"
            style={{ color: 'var(--ink)' }}>
            {business.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} style={{ color: 'var(--subtle)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{business.city}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {business.rating > 0 ? business.rating.toFixed(1) : '—'}
            </span>
          </div>
          {business.review_count > 0 && (
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>
              {business.review_count} reseña{business.review_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Grid card ── */
function GridCard({ business }) {
  const cs = getCatStyle(business.category);
  const showNew = isNew(business.activated_at);

  return (
    <Link to={`/emprendimiento/${business.slug}`} className="group block">
      <article
        className="rounded-xl overflow-hidden transition-all duration-200 flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.10)'; e.currentTarget.style.borderColor = '#93C5FD'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {/* Imagen 4:3 */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={business.image || `https://placehold.co/400x300/EFF6FF/2563EB?text=${encodeURIComponent(business.name[0])}`}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges top-right */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
            {business.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
                style={{ background: '#F59E0B', color: '#fff' }}>
                ✦ Destacado
              </span>
            )}
            {showNew && !business.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--success)', color: '#fff' }}>
                Nuevo
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full self-start"
            style={{ background: cs.bg, color: cs.text }}>
            {business.category}
          </span>

          <div>
            <p className="font-semibold text-[14px] leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors"
              style={{ color: 'var(--ink)' }}>
              {business.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} style={{ color: 'var(--subtle)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{business.city}</span>
              {business.is_verified && (
                <CheckCircle2 size={11} className="ml-1" style={{ color: 'var(--success)' }} />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1">
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                {business.rating > 0 ? business.rating.toFixed(1) : '—'}
              </span>
              {business.review_count > 0 && (
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                  ({business.review_count})
                </span>
              )}
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
              {TYPE_LABELS[business.business_type] || business.business_type}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BusinessCard({ business, viewMode = 'grid' }) {
  if (viewMode === 'list') return <ListCard business={business} />;
  return <GridCard business={business} />;
}
