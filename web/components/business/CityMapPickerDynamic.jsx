'use client';

import dynamic from 'next/dynamic';

// Leaflet accede a `window` al importarse → no puede renderizar en el servidor.
// Lo cargamos solo en el cliente (ssr:false), con un placeholder mientras carga.
const CityMapPicker = dynamic(() => import('./CityMapPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300 }} className="rounded-xl border border-gray-200 flex items-center justify-center text-sm text-gray-400">
      Cargando mapa…
    </div>
  ),
});

export default CityMapPicker;
