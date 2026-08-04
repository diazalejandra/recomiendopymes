'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';

// Autocompletado de direcciones con Nominatim (OpenStreetMap), acotado a Chile.
export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchNominatim = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchText)}&countrycodes=cl&limit=5`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(text), 600);
  };

  const handleSelect = (item) => {
    // Conservamos el texto que escribió el usuario (con número de calle, que Nominatim
    // suele no tener). La sugerencia solo aporta coordenadas + región/comuna.
    setOpen(false);
    if (onSelect) onSelect({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), address: item.address });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Ej: Avenida Providencia 1234, Santiago"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
      </div>

      {open && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 1100 }}>
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Buscando direcciones...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((item) => (
                <li key={item.place_id} onClick={() => handleSelect(item)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700 line-clamp-2">{item.display_name}</span>
                </li>
              ))}
            </ul>
          ) : query.length >= 3 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No encontramos esa dirección</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
