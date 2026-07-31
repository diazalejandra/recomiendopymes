'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de íconos de Leaflet (rutas de assets rotas con bundlers).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CHILE_CITIES = {
  Santiago: [-33.4489, -70.6693], Valparaíso: [-33.0472, -71.6127],
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

export default function CityMapPicker({ city, onCoordinatesChange, initialCoordinates }) {
  const [position, setPosition] = useState(null);
  const [isExact, setIsExact] = useState(false);
  const cityCoords = CHILE_CITIES[city] || [-33.4489, -70.6693];

  useEffect(() => {
    if (initialCoordinates) {
      setPosition([initialCoordinates.lat, initialCoordinates.lng]);
      setIsExact(initialCoordinates.is_exact !== false);
    }
  }, [initialCoordinates]);

  useEffect(() => {
    if (city) {
      const coords = CHILE_CITIES[city] || [-33.4489, -70.6693];
      if (!initialCoordinates?.is_exact) {
        setPosition(coords);
        setIsExact(false);
        onCoordinatesChange({ lat: coords[0], lng: coords[1], is_exact: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    setIsExact(true);
    onCoordinatesChange({ lat: newPos[0], lng: newPos[1], is_exact: true });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        {isExact
          ? '✅ Ubicación exacta configurada. Puedes arrastrar el pin para ajustar.'
          : '📍 Pin en el centro de la ciudad. Haz click en el mapa para ubicar tu negocio exactamente (opcional).'}
      </p>
      <div style={{ height: 300 }} className="rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={cityCoords} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterSetter center={position || cityCoords} />
          <PinDragger position={position || cityCoords} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
    </div>
  );
}
