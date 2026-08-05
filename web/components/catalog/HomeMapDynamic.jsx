'use client';

import dynamic from 'next/dynamic';

// Leaflet accede a `window` al importarse → solo en el cliente (ssr:false),
// con un placeholder del mismo alto que el mapa embebido.
const HomeMap = dynamic(() => import('./HomeMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl overflow-hidden flex items-center justify-center" style={{ height: '70vh', minHeight: '480px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--brand)' }} />
        <p style={{ color: 'var(--muted)' }}>Cargando mapa…</p>
      </div>
    </div>
  ),
});

export default HomeMap;
