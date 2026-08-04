import Link from 'next/link';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';

// Server Component (display puro). El hover se hace en CSS (.biz-grid-card / .biz-list-card)
// para no volver client component a las tarjetas, que son el grueso del catálogo.

const TYPE_LABELS = { online: 'Digital', physical: 'Físico', both: 'Físico y Digital' };

const CAT_COLORS = {
  'Alimentación y Bebidas': { bg: '#FEF3C7', text: '#92400E' },
  'Artesanías y Manualidades': { bg: '#FCE7F3', text: '#9D174D' },
  'Belleza y Cuidado Personal': { bg: '#FDE8F0', text: '#BE185D' },
  'Clothing y Moda': { bg: '#EDE9FE', text: '#5B21B6' },
  'Consultoría y Servicios Profesionales': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Deporte y Vida Saludable': { bg: '#D1FAE5', text: '#065F46' },
  'Educación y Formación': { bg: '#E0F2FE', text: '#0369A1' },
  'Electrónica y Tecnología': { bg: '#F0FDF4', text: '#166534' },
  'Fotografía y Diseño': { bg: '#FEF9C3', text: '#713F12' },
  'Hogar y Decoración': { bg: '#FFF7ED', text: '#9A3412' },
  'Jardinería y Plantas': { bg: '#ECFDF5', text: '#047857' },
  'Mascotas': { bg: '#FDF2F8', text: '#A21CAF' },
};

function getCatStyle(cat) {
  return CAT_COLORS[cat] || { bg: 'var(--brand-light)', text: 'var(--brand)' };
}

function placeholder(name, size) {
  return `https://placehold.co/${size}/EFF6FF/2563EB?text=${encodeURIComponent((name || '?')[0])}`;
}

function ListCard({ business }) {
  const cs = getCatStyle(business.category);
  return (
    <Link href={`/emprendimiento/${business.slug}`} className="group block">
      <div className="biz-list-card flex items-center gap-4 px-4 py-3 rounded-xl">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.image || placeholder(business.name, '128x128')}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cs.bg, color: cs.text }}>
              {business.category}
            </span>
            {business.is_verified && <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />}
          </div>
          <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--ink)' }}>
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

function GridCard({ business }) {
  const cs = getCatStyle(business.category);
  // is_new lo calcula el backend con boost_days (fuente única: badge y orden usan el mismo umbral)
  const showNew = business.is_new;
  return (
    <Link href={`/emprendimiento/${business.slug}`} className="group block">
      <article className="biz-grid-card rounded-xl overflow-hidden flex flex-col">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.image || placeholder(business.name, '400x300')}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
            {business.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: '#F59E0B', color: '#fff' }}>
                ✦ Destacado
              </span>
            )}
            {showNew && !business.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success)', color: '#fff' }}>
                Nuevo
              </span>
            )}
          </div>
        </div>
        <div className="p-3.5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full self-start" style={{ background: cs.bg, color: cs.text }}>
            {business.category}
          </span>
          <div>
            <p className="font-semibold text-[14px] leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--ink)' }}>
              {business.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} style={{ color: 'var(--subtle)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{business.city}</span>
              {business.is_verified && <CheckCircle2 size={11} className="ml-1" style={{ color: 'var(--success)' }} />}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1">
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                {business.rating > 0 ? business.rating.toFixed(1) : '—'}
              </span>
              {business.review_count > 0 && (
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>({business.review_count})</span>
              )}
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
              {TYPE_LABELS[business.business_type] || business.business_type}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BusinessCard({ business, viewMode = 'grid' }) {
  return viewMode === 'list' ? <ListCard business={business} /> : <GridCard business={business} />;
}
