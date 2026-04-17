import { useState, useEffect, useCallback, useRef } from 'react';
import { businessApi, metaApi, newsApi } from '../../utils/api';
import BusinessCard from './BusinessCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, LayoutGrid, List, Map, SlidersHorizontal, X, ChevronDown, Store, Compass } from 'lucide-react';
import ChatbotSearch from './ChatbotSearch';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Íconos por categoría
const CAT_ICONS = {
  'Alimentación y Bebidas':              '🍽️',
  'Artesanías y Manualidades':           '🎨',
  'Belleza y Cuidado Personal':          '💄',
  'Clothing y Moda':                     '👗',
  'Consultoría y Servicios Profesionales': '💼',
  'Deporte y Vida Saludable':            '🏋️',
  'Educación y Formación':               '📚',
  'Electrónica y Tecnología':            '💻',
  'Fotografía y Diseño':                 '📸',
  'Hogar y Decoración':                  '🏠',
  'Jardinería y Plantas':                '🌱',
  'Mascotas':                            '🐾',
};

const VIEWS = [
  { key: 'grid', Icon: LayoutGrid, label: 'Cuadrícula' },
  { key: 'list', Icon: List,       label: 'Lista' },
  { key: 'map',  Icon: Map,        label: 'Mapa' },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden animate-pulse"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ aspectRatio: '4/3', background: 'var(--bg)' }} />
          <div className="p-3 space-y-2">
            <div className="h-3 w-2/3 rounded-full" style={{ background: 'var(--border)' }} />
            <div className="h-4 w-full rounded" style={{ background: 'var(--border)' }} />
            <div className="h-3 w-1/2 rounded" style={{ background: 'var(--border)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl animate-pulse"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-xl flex-shrink-0" style={{ background: 'var(--border)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full" style={{ background: 'var(--border)' }} />
            <div className="h-4 w-3/4 rounded" style={{ background: 'var(--border)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [heroSearch, setHeroSearch] = useState(searchParams.get('search') || '');
  const [heroCity, setHeroCity] = useState(searchParams.get('city') || '');
  const [heroCommitted, setHeroCommitted] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [includeNationwide, setIncludeNationwide] = useState(!!searchParams.get('city') && !!searchParams.get('search'));
  const [mapKey, setMapKey] = useState(0);

  // Reaction to URL changes (when Chatbot pushes new URL)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCity = searchParams.get('city') || '';
    if (urlSearch !== search || urlCity !== city) {
      setSearch(urlSearch);
      setHeroSearch(urlSearch);
      setCity(urlCity);
      setHeroCity(urlCity);
      if (urlCity) setIncludeNationwide(true); // Auto-ON upon new chatbot search
      setPage(1);
    }
  }, [searchParams]);
  const [page, setPage] = useState(1);

  // Data
  const [businesses, setBusinesses] = useState([]);
  const [mapBusinesses, setMapBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef(null);

  const catalogRef = useRef(null);

  const [news, setNews] = useState([]);
  
  // Default backup news
  const BACKUP_NEWS = [
    { tag: 'Fondos', title: 'Sercotec abre nuevas líneas de financiamiento para pymes', date: 'Recurso Permanente', url: 'https://www.sercotec.cl/' },
    { tag: 'Regulación', title: 'Todo sobre la ley de pago a 30 días y cómo te afecta', date: 'Recurso Permanente', url: 'https://www.sii.cl/' },
    { tag: 'Marketing', title: 'Guía: cómo usar redes sociales para atraer clientes locales', date: 'Recurso Permanente', url: '#' },
  ];

  // Load metadata and news
  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories || [])).catch(() => {});
    metaApi.getCities().then(d => setCities(d.cities || [])).catch(() => {});
    newsApi.getPublicNews(3).then(d => setNews(d || [])).catch(() => {});
  }, []);

  // Close city dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Fetch businesses
  const fetchBusinesses = useCallback(() => {
    if (viewMode === 'map') return;
    setLoading(true);
    const params = { page, limit: 16 };
    if (search.trim()) params.search = search.trim();
    if (city) params.city = city;
    if (category) params.category = category;
    if (includeNationwide) params.nationwide = true;

    const t = setTimeout(() => {
      businessApi.list(params)
        .then(d => {
          setBusinesses(d.businesses || []);
          setTotal(d.total || 0);
          setTotalPages(d.total_pages || 1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [search, city, category, includeNationwide, page, viewMode]);

  useEffect(() => { const cleanup = fetchBusinesses(); return cleanup; }, [fetchBusinesses]);

  // Load map data
  useEffect(() => {
    if (viewMode !== 'map') return;
    businessApi.list({ limit: 200, ...(city && { city }), ...(category && { category }) })
      .then(d => setMapBusinesses((d.businesses || []).filter(b => b.coordinates?.lat && b.coordinates?.lng)))
      .catch(() => {});
  }, [viewMode, city, category]);

  const handleHeroSearch = () => {
    setSearch(heroSearch);
    setCity(heroCity);
    setPage(1);
    setHeroCommitted(true);
    
    // Push the state to URL so we have a source of truth
    const sp = new URLSearchParams();
    if (heroSearch) sp.set('search', heroSearch);
    if (heroCity) sp.set('city', heroCity);
    setSearchParams(sp);
    
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAll = () => {
    setSearch(''); setCity(''); setCategory(''); setPage(1);
    setHeroSearch(''); setHeroCity('');
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = search || city || category;
  const topCats = categories.slice(0, 8);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <section style={{
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, var(--bg) 100%)',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }} className="relative px-4 pt-14 pb-12 sm:pt-20 sm:pb-16">
        
        {/* Marca de agua decorativa: Pin de mapa gigante (wireframe) */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-40px',
          opacity: 0.08, pointerEvents: 'none',
          transform: 'rotate(15deg)'
        }}>
          <MapPin size={450} strokeWidth={1.5} color="var(--brand)" />
        </div>
        
        {/* Marca de agua decorativa secundaria (opcional pequeño) */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '-50px',
          opacity: 0.06, pointerEvents: 'none',
          transform: 'rotate(-20deg)'
        }}>
          <MapPin size={250} strokeWidth={1.5} color="var(--brand)" />
        </div>
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold mb-6 shadow-sm transition-transform hover:-translate-y-0.5 cursor-default"
            style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-mid)' }}>
            <img src="https://flagcdn.com/16x12/cl.png" alt="Chile" width="16" height="12" style={{ display: 'inline', verticalAlign: 'middle' }} />
            Directorio de Emprendedores Chilenos
          </div>

          <h1 className="mb-4" style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--ink)',
          }}>
            Encuentra emprendedores<br />
            <span style={{ color: 'var(--brand)' }}>cerca de ti</span>
          </h1>

          <p className="mb-8" style={{ color: '#475569', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            El catálogo más completo de micro y pequeñas empresas de Chile.
          </p>

          {/* ── Search box ── */}
          <div className="rounded-2xl p-1.5 flex flex-col sm:flex-row gap-0 mb-8 max-w-2xl mx-auto w-full"
            style={{ background: 'var(--surface)', boxShadow: '0 4px 28px rgba(15,23,42,0.12)', border: '1px solid var(--border)' }}>

            {/* ¿Qué buscas? */}
            <div className="flex items-center gap-3 flex-1 px-4 py-3 border-b sm:border-b-0"
              style={{ borderColor: 'var(--border)' }}>
              <Search size={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleHeroSearch()}
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: 'var(--ink)' }}
              />
            </div>

            {/* Divider vertical — only desktop */}
            <div className="hidden sm:block w-px self-stretch my-2" style={{ background: 'var(--border)' }} />

            {/* ¿Ciudad? */}
            <div className="flex items-center gap-3 flex-1 px-4 py-2.5" ref={cityRef} style={{ position: 'relative' }}>
              <MapPin size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="¿En qué ciudad?"
                value={heroCity}
                onChange={e => { setHeroCity(e.target.value); setCityOpen(true); }}
                onFocus={() => setCityOpen(true)}
                onKeyDown={e => e.key === 'Enter' && handleHeroSearch()}
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: 'var(--ink)' }}
              />
              {/* Dropdown de ciudades */}
              {cityOpen && cities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', maxHeight: '220px', overflowY: 'auto' }}>
                  {cities
                    .filter(c => !heroCity || c.toLowerCase().includes(heroCity.toLowerCase()))
                    .map(c => (
                      <button key={c}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                        onClick={() => { setHeroCity(c); setCityOpen(false); }}>
                        {c}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Botón buscar */}
            <button
              onClick={handleHeroSearch}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--brand)', color: '#fff', minWidth: '120px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}>
              <Search size={16} />
              Buscar
            </button>
          </div>

          {/* ── Categorías rápidas ── */}
          <div className="flex flex-wrap justify-center gap-2 px-2">
            {topCats.map(cat => (
              <button key={cat}
                onClick={() => { setCategory(cat); setPage(1); catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={{
                  background: category === cat ? 'var(--brand)' : 'var(--surface)',
                  color: category === cat ? '#fff' : 'var(--ink)',
                  borderColor: category === cat ? 'var(--brand)' : 'var(--border)',
                }}
                onMouseEnter={e => { if (category !== cat) { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; } }}
                onMouseLeave={e => { if (category !== cat) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink)'; } }}>
                <span>{CAT_ICONS[cat] || '📦'}</span>
                {cat.split(' y ')[0].split(' y ')[0].split(' de ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CATÁLOGO ════════ */}
      <div style={{ flex: 1, background: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 150px), var(--surface) 100%)' }}>
        <section ref={catalogRef} className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">

        {/* ── Barra de filtros ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-6"
          style={{ borderBottom: '1px solid var(--border)' }}>

          {/* Conteo */}
          <div className="flex-1 min-w-0">
            {!loading && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {category
                  ? <><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> resultado{total !== 1 ? 's' : ''} en <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{category}</span></>
                  : <><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{total}</span> emprendimiento{total !== 1 ? 's' : ''}{city ? ` en ${city}` : ''}</>
                }
              </p>
            )}
          </div>

          {/* Filter pills activos */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {search && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                  "{search}"
                  <button onClick={() => { setSearch(''); setHeroSearch(''); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {city && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                  📍 {city}
                  <button onClick={() => { setCity(''); setHeroCity(''); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                  {CAT_ICONS[category]} {category}
                  <button onClick={() => setCategory('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button onClick={clearAll}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                Limpiar todo
              </button>
              
              {/* Nationwide Toggle */}
              {city && viewMode !== 'map' && (
                <label className="flex items-center gap-1.5 px-3 py-1 ml-2 rounded-full border transition-colors cursor-pointer"
                  style={{ borderColor: includeNationwide ? 'var(--brand)' : 'var(--border)', background: includeNationwide ? 'var(--brand-light)' : 'var(--surface)' }}
                >
                  <input 
                    type="checkbox" 
                    checked={includeNationwide} 
                    onChange={e => { setIncludeNationwide(e.target.checked); setPage(1); }} 
                    className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer"
                  />
                  <span className="text-xs font-medium" style={{ color: includeNationwide ? 'var(--brand)' : 'var(--ink)' }}>
                    Incluir envíos nacionales
                  </span>
                </label>
              )}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden ml-auto flex-shrink-0"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            {VIEWS.map(({ key, Icon, label }) => (
              <button key={key}
                onClick={() => {
                  setViewMode(key);
                  // Each time we switch TO map, increment key to force Leaflet clean remount
                  if (key === 'map') setMapKey(k => k + 1);
                }}
                title={label}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
                style={{
                  background: viewMode === key ? 'var(--brand)' : 'transparent',
                  color: viewMode === key ? '#fff' : 'var(--muted)',
                  borderRight: key !== 'map' ? '1px solid var(--border)' : 'none',
                }}>
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Resultados ── */}
        {viewMode === 'grid' && (
          loading ? <SkeletonGrid /> :
          businesses.length === 0 ? <EmptyState onClear={clearAll} /> : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {businesses.map(b => <BusinessCard key={b.id} business={b} viewMode="grid" />)}
              </div>
              <Pager page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )
        )}

        {viewMode === 'list' && (
          loading ? <SkeletonList /> :
          businesses.length === 0 ? <EmptyState onClear={clearAll} /> : (
            <>
              <div className="flex flex-col gap-2">
                {businesses.map(b => <BusinessCard key={b.id} business={b} viewMode="list" />)}
              </div>
              <Pager page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )
        )}

        {viewMode === 'map' && (
          // key={mapKey} forces React to fully unmount+remount the div+MapContainer
          // every time we switch TO map view — preventing Leaflet's "already initialized" error
          <div key={mapKey} className="rounded-2xl overflow-hidden"
            style={{ height: '70vh', minHeight: '480px', border: '1px solid var(--border)' }}>
            <MapContainer
              center={[-33.4489, -70.6693]} zoom={6}
              style={{ width: '100%', height: '100%' }}
              maxBounds={[[-55.98, -76.37], [-17.5, -66.4]]} minZoom={4}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapBusinesses.map(b => (
                <Marker key={b.id} position={[b.coordinates.lat, b.coordinates.lng]}>
                  <Popup maxWidth={220}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', padding: '12px' }}>
                      {b.image && <img src={b.image} alt={b.name} className="w-full h-28 object-cover rounded-lg mb-2" />}
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>{b.category}</p>
                      <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{b.name}</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{b.city}</p>
                      <Link to={`/emprendimiento/${b.slug}`}
                        className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg"
                        style={{ background: 'var(--brand)', color: '#fff' }}>
                        Ver perfil →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {mapBusinesses.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center pointer-events-auto">
                    <p style={{ color: 'var(--muted)' }}>Sin negocios con ubicación en el mapa</p>
                  </div>
                </div>
              )}
            </MapContainer>
          </div>
        )}
        </section>
      </div>

      {/* ════════ NOTICIAS ════════ */}
      <section className="w-full" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--brand)' }}>Recursos y Novedades</p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>Noticias para emprendedores</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {(news.length > 0 ? news : BACKUP_NEWS).map((item, i) => (
              <a key={item.id || i} href={item.url || '#'} target={item.url ? '_blank' : '_self'} rel="noreferrer"
                className="group rounded-2xl p-5 transition-all outline-none"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', textDecoration: 'none' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block"
                    style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    {item.tag}
                  </span>
                </div>
                
                <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-primary transition-colors" style={{ color: 'var(--ink)' }}>
                  {item.title}
                </h3>
                
                {item.content && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--subtle)' }}>
                    {item.content}
                  </p>
                )}
                
                <p className="text-[11px] font-medium" style={{ color: 'var(--subtle)' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('es-CL') : item.date}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Bot Chatbot */}
      <ChatbotSearch cities={cities} />
    </div>
  );
}

/* ── Helpers ── */
function EmptyState({ onClear }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🔍</p>
      <p className="font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>Sin resultados</p>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Intenta con otros términos o limpia los filtros
      </p>
      <button onClick={onClear}
        className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
        Limpiar filtros
      </button>
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40"
        style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface)' }}>
        ← Anterior
      </button>
      <span className="px-4 py-2 text-sm" style={{ color: 'var(--muted)' }}>
        {page} / {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
        className="px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40"
        style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface)' }}>
        Siguiente →
      </button>
    </div>
  );
}
