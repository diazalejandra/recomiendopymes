'use client';

import dynamic from 'next/dynamic';

// Leaflet accede a `window` al importarse → no puede renderizar en el servidor.
// Se carga solo en el cliente (ssr:false) con un placeholder a pantalla completa.
const MapExplorer = dynamic(() => import('./MapExplorer'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--brand)' }} />
        <p style={{ color: 'var(--muted)' }}>Cargando mapa…</p>
      </div>
    </div>
  ),
});

export default MapExplorer;
