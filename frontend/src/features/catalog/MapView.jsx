import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { businessApi, metaApi } from '../../utils/api';
import { Search, MapPin, Star, X, Layers, Navigation } from 'lucide-react';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CHILE_CENTER = [-33.4489, -70.6693];
const CHILE_BOUNDS = [[-55.98, -76.37], [-17.5, -66.4]];

// Custom blue brand marker
const brandIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;
    background:var(--brand,#2563EB);
    border:3px solid #fff;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,.25);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  className: '',
});

const featuredIcon = new L.DivIcon({
  html: `<div style="
    width:36px;height:36px;
    background:#F59E0B;
    border:3px solid #fff;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,.3);
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -40],
  className: '',
});

const CAT_ICONS = {
  'Alimentación y Bebidas':                '🍽️',
  'Artesanías y Manualidades':             '🎨',
  'Belleza y Cuidado Personal':            '💄',
  'Clothing y Moda':                       '👗',
  'Consultoría y Servicios Profesionales': '💼',
  'Deporte y Vida Saludable':              '🏋️',
  'Educación y Formación':                 '📚',
  'Electrónica y Tecnología':              '💻',
  'Fotografía y Diseño':                   '📸',
  'Hogar y Decoración':                    '🏠',
  'Jardinería y Plantas':                  '🌱',
  'Mascotas':                              '🐾',
};

// Component to fly map to user location
function FlyToUser({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 1.5 });
  }, [position, map]);
  return null;
}

// User location blue dot
const userIcon = new L.DivIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#3B82F6;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 6px rgba(59,130,246,.25), 0 2px 6px rgba(0,0,0,.2);
    animation: pulse-ring 2s ease-out infinite;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

export default function MapView() {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  // Unique key per mount — prevents Leaflet "already initialized" with React StrictMode
  const [mapKey] = useState(() => `leaflet-full-${Date.now()}`);

  // Load all businesses + meta
  useEffect(() => {
    Promise.all([
      businessApi.list({ limit: 500 }),
      metaApi.getCategories().catch(() => ({ categories: [] })),
      metaApi.getCities().catch(() => ({ cities: [] })),
    ]).then(([data, cats, citiesData]) => {
      const all = (data.businesses || []);
      setAllBusinesses(all);
      setFiltered(all.filter(b => b.coordinates?.lat && b.coordinates?.lng));
      setCategories(cats.categories || []);
      setCities(citiesData.cities || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Request geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {},  // silently ignore denied
        { enableHighAccuracy: false, timeout: 8000 }
      );
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let list = allBusinesses.filter(b => b.coordinates?.lat && b.coordinates?.lng);
    if (selectedCat) list = list.filter(b => b.category === selectedCat);
    if (selectedCity) list = list.filter(b => b.city === selectedCity);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [selectedCat, selectedCity, search, allBusinesses]);

  const clearFilters = () => { setSelectedCat(''); setSelectedCity(''); setSearch(''); };
  const hasFilters = selectedCat || selectedCity || search;

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? '280px' : '0',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}>
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

          {/* Header sidebar */}
          <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Filtros del mapa
              </p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs px-2 py-0.5 rounded transition-colors"
                  style={{ color: 'var(--brand)', background: 'var(--brand-light)' }}>
                  Limpiar
                </button>
              )}
            </div>
            {/* Buscador */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar negocio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: 'var(--ink)' }}
              />
              {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted)' }} /></button>}
            </div>
          </div>

          {/* Contador */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{filtered.length}</span> negocio{filtered.length !== 1 ? 's' : ''} con ubicación
              {hasFilters && <span style={{ color: 'var(--brand)' }}> (filtrados)</span>}
            </p>
          </div>

          {/* Ciudad */}
          <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              Ciudad
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCity('')}
                className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: !selectedCity ? 'var(--brand)' : 'transparent',
                  color: !selectedCity ? '#fff' : 'var(--ink)',
                  fontWeight: !selectedCity ? 600 : 400,
                }}>
                Todas las ciudades
              </button>
              {cities.filter(city => allBusinesses.some(b => b.city === city && b.coordinates?.lat)).map(city => (
                <button key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? '' : city)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group"
                  style={{
                    background: selectedCity === city ? 'var(--brand-light)' : 'transparent',
                    color: selectedCity === city ? 'var(--brand)' : 'var(--ink)',
                  }}
                  onMouseEnter={e => { if (selectedCity !== city) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (selectedCity !== city) e.currentTarget.style.background = 'transparent'; }}>
                  <span className="flex items-center gap-2">
                    <MapPin size={12} style={{ color: 'var(--muted)' }} />
                    {city}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                    {allBusinesses.filter(b => b.city === city && b.coordinates?.lat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              Categoría
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCat('')}
                className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: !selectedCat ? 'var(--brand)' : 'transparent',
                  color: !selectedCat ? '#fff' : 'var(--ink)',
                  fontWeight: !selectedCat ? 600 : 400,
                }}>
                Todas las categorías
              </button>
              {categories.filter(cat => allBusinesses.some(b => b.category === cat && b.coordinates?.lat)).map(cat => (
                <button key={cat}
                  onClick={() => setSelectedCat(cat === selectedCat ? '' : cat)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between"
                  style={{
                    background: selectedCat === cat ? 'var(--brand-light)' : 'transparent',
                    color: selectedCat === cat ? 'var(--brand)' : 'var(--ink)',
                  }}
                  onMouseEnter={e => { if (selectedCat !== cat) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (selectedCat !== cat) e.currentTarget.style.background = 'transparent'; }}>
                  <span className="flex items-center gap-2">
                    <span>{CAT_ICONS[cat] || '📦'}</span>
                    <span className="text-xs">{cat}</span>
                  </span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                    {allBusinesses.filter(b => b.category === cat && b.coordinates?.lat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAPA + toggle ── */}
      <div style={{ flex: 1, position: 'relative' }}>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute z-[1001] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-md transition-all"
          style={{
            top: '12px', left: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Layers size={14} />
          {sidebarOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        {/* Active filter chips — floats over map */}
        {hasFilters && (
          <div className="absolute z-[1001] flex gap-2 flex-wrap"
            style={{ top: '12px', left: sidebarOpen ? '160px' : '130px', right: '12px' }}>
            {selectedCat && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                {CAT_ICONS[selectedCat]} {selectedCat}
                <button onClick={() => setSelectedCat('')}><X size={11} /></button>
              </span>
            )}
            {selectedCity && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                📍 {selectedCity}
                <button onClick={() => setSelectedCity('')}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center" style={{ height: '100%', background: 'var(--bg)' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3"
                style={{ borderColor: 'var(--brand)' }} />
              <p style={{ color: 'var(--muted)' }}>Cargando mapa...</p>
            </div>
          </div>
        ) : (
          <div key={mapKey} style={{ height: '100%', width: '100%' }}>
            <MapContainer
              center={CHILE_CENTER}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              maxBounds={CHILE_BOUNDS}
              minZoom={4}
            >
              <FlyToUser position={userPosition} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* User location marker */}
              {userPosition && (
                <Marker position={userPosition} icon={userIcon}>
                  <Popup><span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>📍 Tu ubicación</span></Popup>
                </Marker>
              )}
              {filtered.map(b => (
                <Marker
                  key={b.id}
                  position={[b.coordinates.lat, b.coordinates.lng]}
                  icon={b.featured ? featuredIcon : brandIcon}
                >
                  <Popup maxWidth={240} minWidth={200}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', padding: '4px' }}>
                      {/* Image placeholder */}
                      <div className="rounded-lg overflow-hidden mb-2"
                        style={{ height: '100px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {b.image
                          ? <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                          : <span style={{ fontSize: '2.5rem', color: 'var(--brand)' }}>{b.name[0]}</span>
                        }
                      </div>
                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>
                        {CAT_ICONS[b.category] || '📦'} {b.category}
                      </p>
                      <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--ink)' }}>{b.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={10} style={{ color: 'var(--subtle)' }} />
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{b.city}</p>
                        {b.rating > 0 && (
                          <>
                            <span style={{ color: 'var(--border)' }}>·</span>
                            <Star size={10} fill="#F59E0B" color="#F59E0B" />
                            <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{b.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                      <Link to={`/emprendimiento/${b.slug}`}
                        className="block text-center text-xs font-semibold py-2 px-3 rounded-lg transition-opacity"
                        style={{ background: 'var(--brand)', color: '#fff' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}>
                        Ver perfil →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Empty state over map */}
        {!loading && filtered.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <div className="pointer-events-auto text-center px-6 py-5 rounded-2xl shadow-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-3xl mb-2">🗺️</p>
              <p className="font-bold mb-1" style={{ color: 'var(--ink)' }}>Sin negocios en el mapa</p>
              <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
                {hasFilters ? 'Prueba cambiando los filtros' : 'No hay negocios con ubicación registrada'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--brand)', color: '#fff' }}>
                  Ver todos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
