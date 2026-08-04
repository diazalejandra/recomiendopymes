'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de íconos de Leaflet (rutas de assets rotas con bundlers).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SANTIAGO = [-33.4489, -70.6693];

// Coordenadas rápidas de las ciudades grandes (evita geocodificar las más comunes).
const CHILE_CITIES = {
  Santiago: SANTIAGO, Valparaíso: [-33.0472, -71.6127],
  'Viña del Mar': [-33.0245, -71.5518], Concepción: [-36.8201, -73.0444],
  Temuco: [-38.7359, -72.5904], 'La Serena': [-29.9027, -71.2519],
  Antofagasta: [-23.6509, -70.3975], Rancagua: [-34.1708, -70.7444],
  Talca: [-35.4264, -71.6554], Arica: [-18.4783, -70.3126],
  Iquique: [-20.2141, -70.1522], 'Puerto Montt': [-41.4693, -72.9424],
  'Punta Arenas': [-53.1638, -70.9171], Coyhaique: [-45.5712, -72.0688],
  Osorno: [-40.574, -73.1344], Valdivia: [-39.8196, -73.2458],
};

function PinDragger({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const ll = e.target.getLatLng();
          setPosition([ll.lat, ll.lng]);
        },
      }}
    />
  ) : null;
}

function MapCenterSetter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function CityMapPicker({ city, region, onCoordinatesChange, initialCoordinates }) {
  const [position, setPosition] = useState(initialCoordinates ? [initialCoordinates.lat, initialCoordinates.lng] : CHILE_CITIES[city] || null);
  const [isExact, setIsExact] = useState(initialCoordinates?.is_exact === true);

  // Coordenadas exactas (dirección elegida o pin arrastrado, o negocio ya guardado con is_exact).
  useEffect(() => {
    if (initialCoordinates?.is_exact) {
      setPosition([initialCoordinates.lat, initialCoordinates.lng]);
      setIsExact(true);
    }
  }, [initialCoordinates]);

  // Al cambiar la comuna: centrar el pin en el CENTRO DE LA COMUNA (no en Santiago).
  // Ciudades grandes → estático; el resto → geocodificar con Nominatim. No pisa una
  // ubicación exacta ya fijada (dirección/pin).
  useEffect(() => {
    if (!city || initialCoordinates?.is_exact) return;
    let cancelled = false;
    const apply = (coords) => {
      if (cancelled) return;
      setPosition(coords);
      setIsExact(false);
      onCoordinatesChange({ lat: coords[0], lng: coords[1], is_exact: false });
    };
    const known = CHILE_CITIES[city];
    if (known) {
      apply(known);
    } else {
      const q = [city, region, 'Chile'].filter(Boolean).join(', ');
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=cl&limit=1`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d[0]) apply([parseFloat(d[0].lat), parseFloat(d[0].lon)]);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, region]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    setIsExact(true);
    onCoordinatesChange({ lat: newPos[0], lng: newPos[1], is_exact: true });
  };

  const center = position || CHILE_CITIES[city] || SANTIAGO;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        {isExact
          ? '✅ Ubicación exacta configurada. Puedes arrastrar el pin para ajustar.'
          : '📍 Pin en el centro de la comuna. Haz click en el mapa o arrastra el pin para ubicar tu negocio exactamente (opcional).'}
      </p>
      <div style={{ height: 300 }} className="rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={center} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterSetter center={center} />
          <PinDragger position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
    </div>
  );
}
