import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatbotSearch({ cities = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const lowerQ = query.toLowerCase();
    
    // Detect city (from prop array matching)
    const detectedCity = cities.find(c => lowerQ.includes(c.toLowerCase()));
    
    // Fallback: strip city and common words to get "category" or search term
    let searchTerm = lowerQ;
    if (detectedCity) searchTerm = searchTerm.replace(detectedCity.toLowerCase(), '');
    searchTerm = searchTerm.replace(/(quiero|busco|en|que|tenga|hacia|cerca|de|para|ofrezca|envie)/g, '').trim();

    // Redirect to home with query params
    const params = new URLSearchParams();
    if (detectedCity) params.set('city', detectedCity);
    if (searchTerm) params.set('search', searchTerm);
    
    // We navigate to / with query params and let HomePage catch them, OR
    // since HomePage in this app uses state instead of query params, 
    // we may need to pass this somehow.
    // Wait, HomePage doesn't read URL params! It uses local state.
    // I should update it to read URL params or pass state.
    navigate(`/?${params.toString()}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button 
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center animate-[bounce_2s_infinite]"
        >
          <Bot size={28} />
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden flex flex-col pointer-events-auto">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">PymeBot 🤖</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
          </div>
          <div className="p-4 bg-gray-50 text-sm text-gray-700">
            <p className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 inline-block rounded-tl-none">
              ¡Hola! Dime qué buscas y yo filtro el catálogo.<br/><br/>Ej: <span className="text-gray-400 italic">"Ropa que envíen a Santiago"</span>
            </p>
          </div>
          <form onSubmit={handleSearch} className="p-3 border-t bg-white flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Escribe aquí..."
              autoFocus
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 border border-transparent focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
