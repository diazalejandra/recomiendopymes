'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { businessApi } from '@/utils/api';

// Fix de íconos de Leaflet (rutas de assets rotas con bundlers).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CHILE_CENTER = [-33.4489, -70.6693];
const CHILE_BOUNDS = [[-55.98, -76.37], [-17.5, -66.4]];

// Ajusta el encuadre a los marcadores visibles
function MapFitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.coordinates.lat, m.coordinates.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [markers, map]);
  return null;
}

export default function HomeMap({ search = '', city = '', category = '', nationwide = false }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Key único por montaje — evita el "already initialized" de Leaflet con StrictMode
  const [mapKey] = useState(() => `home-map-${Date.now()}`);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    businessApi
      .list({ search, city, category, nationwide, limit: 500 })
      .then((data) => {
        if (!alive) return;
        const withCoords = (data.businesses || []).filter((b) => b.coordinates?.lat && b.coordinates?.lng);
        setMarkers(withCoords);
      })
      .catch(() => { if (alive) setMarkers([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [search, city, category, nationwide]);

  return (
    <div key={mapKey} className="rounded-2xl overflow-hidden relative" style={{ height: '70vh', minHeight: '480px', border: '1px solid var(--border)' }}>
      <MapContainer center={CHILE_CENTER} zoom={6} style={{ width: '100%', height: '100%' }} maxBounds={CHILE_BOUNDS} minZoom={4}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFitBounds markers={markers} />
        {markers.map((b) => (
          <Marker key={b.id} position={[b.coordinates.lat, b.coordinates.lng]}>
            <Popup maxWidth={220}>
              <div style={{ fontFamily: 'Outfit, sans-serif', padding: '12px' }}>
                {b.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                )}
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>{b.category}</p>
                <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{b.name}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{b.city}</p>
                <Link href={`/emprendimiento/${b.slug}`} className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg" style={{ background: 'var(--brand)', color: '#fff' }}>
                  Ver perfil →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {!loading && markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center pointer-events-auto">
            <p style={{ color: 'var(--muted)' }}>Sin negocios con ubicación en el mapa</p>
          </div>
        </div>
      )}
    </div>
  );
}
