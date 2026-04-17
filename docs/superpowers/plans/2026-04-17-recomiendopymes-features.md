# RecomiendoPymes Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement business metrics, dynamic offers, WhatsApp direct contact, geo-segmented delivery options, and a simple keyword-based search chatbot based on the competitive analysis findings.

**Architecture:** Modifies the MongoDB `Business` Pydantic models to support arrays for delivery methods and an embedded `Offer` model. Exposes `view_count` on the frontend Dashboard. Overhauls the React UI in the Catalog (Cards, Map, Profile) to respect these new models and track intents. Introduces a lightweight frontend-only parser component for the Chatbot.

**Tech Stack:** FastAPI, Pydantic, React, Leaflet, Tailwind.

---

### Task 1: Extend Backend Models (`Offer` & `DeliveryMethods`)

**Files:**
- Modify: `backend/modules/business/models.py`
- Test: `backend/tests/test_business_models.py` (assuming tests exist or we'll create a simple check).

- [ ] **Step 1: Write the failing test**

```python
# Create: backend/tests/test_business_features.py
from datetime import datetime, timedelta
from backend.modules.business.models import Business, Offer

def test_business_offer_and_delivery_methods():
    future_date = datetime.utcnow() + timedelta(days=2)
    offer = Offer(title="10% OFF", discount="10%", expires_at=future_date)
    
    business = Business(
        name="Test",
        slug="test",
        category="Test",
        description="A"*10,
        owner="Owner",
        business_type="online",
        city="Santiago",
        delivery_methods=["store_pickup", "home_delivery"],
        delivery_scope="nationwide",
        active_offer=offer
    )
    
    assert business.active_offer.title == "10% OFF"
    assert "store_pickup" in business.delivery_methods
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_business_features.py -v`
Expected: FAIL because `Offer` is not defined and `delivery_methods` doesn't exist on `Business`.

- [ ] **Step 3: Write minimal implementation**

Modify `backend/modules/business/models.py`:
Add `Offer` class at the top, and update `Business`, `BusinessCreate`, `BusinessUpdate`, and `BusinessPublic`. Replace `delivery_type` logic with `delivery_scope` and `delivery_methods`.

```python
# Insert near top of models.py
class Offer(BaseModel):
    title: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    discount: str = Field(..., max_length=20)
    expires_at: datetime

# In BusinessCreate, BusinessUpdate, Business, and BusinessPublic:
# Remove: delivery_type: str ...
# Add:
    delivery_scope: str = Field(default="local", pattern="^(nationwide|local)$")
    delivery_methods: List[str] = Field(default_factory=list) # "store_pickup", "home_delivery", "meeting_point"
    active_offer: Optional[Offer] = None
```

*(Note: Data migration/validation may require tweaking the DB if run in prod, but for models this is sufficient.)*

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_business_features.py -v`
Expected: PASS

- [ ] **Step 5: Commit (if auto_commit enabled)**

Check `.agent/config.yml` for `auto_commit` setting.

---

### Task 2: Entrepreneur Dashboard Metrics Update

**Files:**
- Modify: `frontend/src/features/entrepreneur/Dashboard.jsx`

- [ ] **Step 1: Write the minimal implementation**

Modify the dashboard to display the `view_count` returned by the backend.

```javascript
// In frontend/src/features/entrepreneur/Dashboard.jsx
import { Eye, Star, MessageSquare } from 'lucide-react';

// Inside the component, add this block above the controls
<div className="grid grid-cols-3 gap-4 mb-8">
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
    <Eye className="text-blue-500 mb-2" size={24} />
    <span className="text-2xl font-bold">{business?.view_count || 0}</span>
    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Visitas</span>
  </div>
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
    <Star className="text-yellow-500 mb-2" size={24} />
    <span className="text-2xl font-bold">{business?.rating?.toFixed(1) || "0.0"}</span>
    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Rating</span>
  </div>
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
    <MessageSquare className="text-purple-500 mb-2" size={24} />
    <span className="text-2xl font-bold">{business?.review_count || 0}</span>
    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Reseñas</span>
  </div>
</div>
```

- [ ] **Step 2: Commit (if auto_commit enabled)**

---

### Task 3: WhatsApp Direct Integration & Offer UI in Profile

**Files:**
- Modify: `frontend/src/features/catalog/BusinessProfile.jsx` (assuming exists)

- [ ] **Step 1: Write the minimal implementation**

```javascript
// Assuming BusinessProfile.jsx displays business details
import { MessageCircle, Zap } from 'lucide-react';

// For the Offer Banner
{business.active_offer && new Date(business.active_offer.expires_at) > new Date() && (
  <div className="w-full bg-orange-100 border border-orange-300 p-4 rounded-lg flex items-center gap-3 mb-6">
    <Zap className="text-orange-500" />
    <div>
      <p className="font-bold text-orange-800">🔥 Oferta: {business.active_offer.title} ({business.active_offer.discount})</p>
      {business.active_offer.description && <p className="text-sm text-orange-700">{business.active_offer.description}</p>}
    </div>
  </div>
)}

// For the WhatsApp CTA
{business.social_links?.whatsapp && (
  <a 
    href={`https://wa.me/${business.social_links.whatsapp.replace(/[^0-9]/g, '')}?text=Hola, vi tu negocio ${business.name} en RecomiendoPymes!`}
    target="_blank" rel="noreferrer"
    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl w-full mt-4 transition-colors"
  >
    <MessageCircle size={20} />
    Contactar por WhatsApp
  </a>
)}

// For Delivery Methods
<div className="mt-4 border-t pt-4">
  <p className="font-semibold text-sm text-gray-500 mb-2">OPCIONES DE ENTREGA</p>
  <ul className="flex gap-2">
     {business.delivery_methods?.includes('home_delivery') && <li className="bg-gray-100 px-2 py-1 rounded text-xs">🏠 Envío a domicilio</li>}
     {business.delivery_methods?.includes('store_pickup') && <li className="bg-gray-100 px-2 py-1 rounded text-xs">🏪 Retiro en tienda</li>}
     {business.delivery_methods?.includes('meeting_point') && <li className="bg-gray-100 px-2 py-1 rounded text-xs">🤝 Puntos de encuentro</li>}
  </ul>
</div>
```

- [ ] **Step 2: Commit (if auto_commit enabled)**

---

### Task 4: Map View Toggle for Nationwide Delivery

**Files:**
- Modify: `frontend/src/features/catalog/MapView.jsx`
- Modify: `frontend/src/features/catalog/HomePage.jsx` (List view filter logic if applicable)

- [ ] **Step 1: Write minimal implementation for MapView**

Update `MapView.jsx` to explicitly mention physical only, while extracting the "Nationwide Toggle" mostly for the HomePage/List View. We will add the toggle switch to `HomePage.jsx` instead, as the spec says "Regla Catálogo (Grid/Lista) tendrá un toggle".

```javascript
 // In frontend/src/features/catalog/HomePage.jsx
 // Add state: const [includeNationwide, setIncludeNationwide] = useState(false);
 // Modify the filtering logic where it filters by selectedCity:
 
 let list = allBusinesses;
 if (selectedCity) {
   list = list.filter(b => 
     b.city === selectedCity || 
     (includeNationwide && b.delivery_scope === 'nationwide')
   );
 }
 
 // Add Toggle UI near the city filter dropdown
 <label className="flex items-center gap-2 mt-2 cursor-pointer">
   <input 
      type="checkbox" 
      checked={includeNationwide} 
      onChange={(e) => setIncludeNationwide(e.target.checked)} 
      className="rounded text-blue-600"
   />
   <span className="text-sm">Incluir despachos nacionales</span>
 </label>
```

- [ ] **Step 2: Commit (if auto_commit enabled)**

---

### Task 5: Chatbot Keyword Search Component

**Files:**
- Create: `frontend/src/features/catalog/ChatbotSearch.jsx`
- Modify: `frontend/src/App.jsx` to mount it globally or in HomePage.

- [ ] **Step 1: Write the minimal implementation**

```javascript
// frontend/src/features/catalog/ChatbotSearch.jsx
import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatbotSearch({ cities }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Simple local NLP proxy
    const lowerQ = query.toLowerCase();
    
    // Detect city (from prop array matching)
    const detectedCity = cities.find(c => lowerQ.includes(c.toLowerCase()));
    
    // Fallback: strip city and common words to get "category" or search term
    let searchTerm = lowerQ;
    if (detectedCity) searchTerm = searchTerm.replace(detectedCity.toLowerCase(), '');
    searchTerm = searchTerm.replace(/(quiero|busco|en|que|tenga|hacia|cerca|de|para)/g, '').trim();

    // Redirect to home with query params
    const params = new URLSearchParams();
    if (detectedCity) params.set('city', detectedCity);
    if (searchTerm) params.set('q', searchTerm);
    
    navigate(`/?${params.toString()}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button 
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
        >
          <Bot size={28} />
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden flex flex-col pointer-events-auto">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">Asistente Local</span>
            </div>
            <button onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="p-4 bg-gray-50 text-sm text-gray-700">
            <p className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 inline-block rounded-tl-none">
              ¡Hola! Dime qué buscas y te ayudo a filtrarlo. Ej: "Ropa abrigada que envíe a Santiago"
            </p>
          </div>
          <form onSubmit={handleSearch} className="p-3 border-t bg-white flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Escribe tu búsqueda..."
              autoFocus
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none w-full"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 text-sm rounded-full w-9 h-9 flex items-center justify-center">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit (if auto_commit enabled)**
