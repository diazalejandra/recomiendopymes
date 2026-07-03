'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

// Buscador del hero. Al enviar, navega a /?search=&city= (URL como estado → el server
// re-renderiza el catálogo). Es el único trozo interactivo del home.
export default function CatalogSearch({ cities = [], initialSearch = '', initialCity = '' }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit() {
    const qs = new URLSearchParams();
    if (search.trim()) qs.set('search', search.trim());
    if (city.trim()) qs.set('city', city.trim());
    router.push(qs.toString() ? `/?${qs.toString()}` : '/');
  }

  const filteredCities = cities.filter((c) => !city || c.toLowerCase().includes(city.toLowerCase()));

  return (
    <div
      className="rounded-2xl p-1.5 flex flex-col sm:flex-row gap-0 mb-8 max-w-2xl mx-auto w-full"
      style={{ background: 'var(--surface)', boxShadow: '0 4px 28px rgba(15,23,42,0.12)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 flex-1 px-4 py-3 border-b sm:border-b-0" style={{ borderColor: 'var(--border)' }}>
        <Search size={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="¿Qué estás buscando?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full text-sm outline-none bg-transparent"
          style={{ color: 'var(--ink)' }}
        />
      </div>

      <div className="hidden sm:block w-px self-stretch my-2" style={{ background: 'var(--border)' }} />

      <div className="flex items-center gap-3 flex-1 px-4 py-2.5" ref={cityRef} style={{ position: 'relative' }}>
        <MapPin size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="¿En qué ciudad?"
          value={city}
          onChange={(e) => { setCity(e.target.value); setCityOpen(true); }}
          onFocus={() => setCityOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full text-sm outline-none bg-transparent"
          style={{ color: 'var(--ink)' }}
        />
        {cityOpen && filteredCities.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', maxHeight: '220px', overflowY: 'auto' }}
          >
            {filteredCities.map((c) => (
              <button
                key={c}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg)]"
                style={{ color: 'var(--ink)' }}
                onClick={() => { setCity(c); setCityOpen(false); }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
        style={{ background: 'var(--brand)', color: '#fff', minWidth: '120px' }}
      >
        <Search size={16} />
        Buscar
      </button>
    </div>
  );
}
