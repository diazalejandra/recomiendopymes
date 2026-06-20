import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { businessApi, metaApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import CityMapPicker from './CityMapPicker';
import CloudinaryUpload from './CloudinaryUpload';
import AddressAutocomplete from './AddressAutocomplete';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'online', label: 'Solo digital (redes sociales, web)' },
  { value: 'physical', label: 'Solo físico (local físico)' },
  { value: 'both', label: 'Mixto (físico y digital)' },
];

const DELIVERY_CARDS = [
  { id: 'local_delivery', icon: '🛵', title: 'Despacho Local', desc: 'Dentro de tu ciudad/comuna' },
  { id: 'nationwide', icon: '✈️', title: 'Envío a todo Chile', desc: 'Vía courier (Starken, etc)' },
  { id: 'store_pickup', icon: '🏪', title: 'Retiro en tienda', desc: 'El cliente va hacia ti' },
  { id: 'meeting_point', icon: '🤝', title: 'Punto de encuentro', desc: 'Zonas céntricas o metro' }
];

const STEPS = ['Datos básicos', 'Contacto y redes', 'Ubicación', 'Imágenes', 'Confirmar'];

export default function ListBusinessPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [regionsData, setRegionsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', owner: '',
    business_type: 'online', delivery_scope: 'local', delivery_methods: [],
    region: '', city: '', location: '', coordinates: null,
    social_links: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '', email: '' },
    image: '', gallery: [],
    accept_terms: false,
  });

  const [uiDelivery, setUiDelivery] = useState({
    local_delivery: false, nationwide: false, store_pickup: false, meeting_point: false
  });

  // Auth flow for guests
  const { register: registerUser, login: loginUser } = useAuth();
  const [authMode, setAuthMode] = useState('register'); // register or login
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories)).catch(() => {});
    metaApi.getLocations().then(d => setRegionsData(d.regions || {})).catch(() => {});
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  
  const sanitizeSocialInput = (key, value) => {
    if (key === 'whatsapp') return value.replace(/[^0-9]/g, '');
    if (key === 'email') return value.trim();
    return value.trim().replace(/\s/g, ''); // Sin espacios en URLs
  };

  const setSocial = (key, value) => setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: sanitizeSocialInput(key, value) } }));

  useEffect(() => {
    if (form.business_type === 'online') {
      if (uiDelivery.store_pickup) {
        set('delivery_methods', form.delivery_methods.filter(m => m !== 'store_pickup'));
      }
    }
  }, [form.business_type]);

  const canProceedStep = () => {
    const hasDelivery = Object.values(uiDelivery).some(v => v);
    if (step === 0) return form.name && form.category && form.description.length >= 10 && form.owner && hasDelivery;
    if (step === 1) return true; // Redes sociales opcionales
    if (step === 2) return !!form.city; // La comuna es requerida
    if (step === 3) return true; // La imagen es opcional
    if (step === 4) {
       if (!form.accept_terms) return false;
       if (!isLoggedIn) {
          if (authMode === 'register') return !!(authForm.email && authForm.password && authForm.name);
          return !!(authForm.email && authForm.password);
       }
       return true;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.accept_terms) return toast.error('Debes aceptar los términos y condiciones');
    setLoading(true);
    try {
      // 1. Auth flow if not logged in
      if (!isLoggedIn) {
        if (authMode === 'register') {
           await registerUser(authForm.email, authForm.password, authForm.name);
        } else {
           await loginUser(authForm.email, authForm.password);
        }
      }

      // 2. Format business data
      const data = { ...form };
      delete data.accept_terms;
      
      data.delivery_scope = uiDelivery.nationwide ? 'nationwide' : 'local';
      data.delivery_methods = [];
      if (uiDelivery.local_delivery || uiDelivery.nationwide) data.delivery_methods.push('home_delivery');
      if (uiDelivery.store_pickup) data.delivery_methods.push('store_pickup');
      if (uiDelivery.meeting_point) data.delivery_methods.push('meeting_point');

      Object.keys(data.social_links).forEach(k => {
        if (!data.social_links[k]) delete data.social_links[k];
      });
      
      // 3. Create business
      await businessApi.create(data);
      setSubmitted(true);
      toast.success(authMode === 'register' ? 'Cuenta creada y negocio inscrito' : 'Negocio inscrito exitosamente');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error en el proceso. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Recibido exitosamente!</h2>
      <p className="text-gray-600 mb-2">
        Tu emprendimiento <strong>{form.name}</strong> ha sido enviado.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Actualmente se encuentra <span className="font-semibold text-amber-600">pendiente de revisión</span>. 
        Una vez aprobado, aparecerá en el catálogo público.
      </p>
      {isLoggedIn && (
        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-3 inline-block">
          Ir a mi panel
        </Link>
      )}
      <Link to="/" className="text-blue-600 hover:underline">Volver al catálogo</Link>
    </div>
  );

  const showMapStep = form.business_type === 'physical' || form.business_type === 'both';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscribe tu emprendimiento</h1>
      <p className="text-gray-600 text-sm mb-6">Aparece en el catálogo de emprendedores chilenos de forma gratuita</p>

      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`} />
            <p className="text-xs text-gray-400 mt-1 hidden sm:block">{label}</p>
          </div>
        ))}
      </div>

      {/* Step 0: Datos básicos */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Datos básicos</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del emprendimiento *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" placeholder="Mi Tienda Artesanal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del responsable *</label>
            <input type="text" value={form.owner} onChange={e => set('owner', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecciona una categoría</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción * <span className="text-gray-400">({form.description.length}/1000)</span>
            </label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} maxLength={1000} minLength={10}
              placeholder="Describe tu emprendimiento, qué ofreces y qué te hace especial..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio *</label>
              <select value={form.business_type} onChange={e => set('business_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            
            <div className="sm:col-span-2 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Opciones de entrega * (Mín. 1)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DELIVERY_CARDS.map(opt => {
                  const active = uiDelivery[opt.id];
                  const isDisabled = opt.id === 'store_pickup' && form.business_type === 'online';
                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => !isDisabled && setUiDelivery(prev => ({...prev, [opt.id]: !prev[opt.id]}))}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : 
                        active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="text-xl mt-0.5">{opt.icon}</div>
                      <div>
                        <p className={`font-bold text-sm ${active ? 'text-blue-900' : 'text-gray-900'}`}>{opt.title}</p>
                        <p className={`text-xs ${active ? 'text-blue-700' : 'text-gray-500'}`}>{opt.desc}</p>
                      </div>
                      <div className="ml-auto flex-shrink-0 mt-1">
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {active && <span className="text-white text-xs">✓</span>}
                         </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Contacto y redes */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Contacto y redes sociales</h2>
          {[
            { key: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/tu_usuario' },
            { key: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/tu_pagina' },
            { key: 'tiktok', label: '🎵 TikTok', placeholder: 'https://tiktok.com/@tu_usuario' },
            { key: 'whatsapp', label: '📞 WhatsApp', placeholder: '56912345678 (sin + ni espacios)' },
            { key: 'website', label: '🌐 Sitio web', placeholder: 'https://tusitio.cl' },
            { key: 'email', label: '✉️ Correo de contacto', placeholder: 'contacto@miemprendimiento.cl' },
            { key: 'youtube', label: '▶️ YouTube', placeholder: 'https://youtube.com/@micanal' },
            { key: 'linkedin', label: '💼 LinkedIn', placeholder: 'https://linkedin.com/company/...' },
            { key: 'twitter', label: '🐦 Twitter / X', placeholder: 'https://x.com/miusuario' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input 
                type={key === 'email' ? 'email' : key === 'whatsapp' ? 'tel' : 'text'} 
                value={form.social_links[key] || ''} 
                onChange={e => setSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" 
              />
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Mapa */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ubicación</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Región *</label>
            <select value={form.region} onChange={e => { set('region', e.target.value); set('city', ''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecciona tu región</option>
              {Object.keys(regionsData).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comuna *</label>
            <select value={form.city} onChange={e => set('city', e.target.value)} disabled={!form.region}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              <option value="">Selecciona tu comuna</option>
              {(regionsData[form.region] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(form.business_type === 'physical' || form.business_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección exacta o referencia</label>
               <AddressAutocomplete 
                  value={form.location}
                  onChange={(text) => set('location', text)}
                  onSelect={(coords) => set('coordinates', coords)}
               />
            </div>
          )}

          {!showMapStep ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mt-6">
              <p className="text-blue-700 text-sm">Tu negocio es 100% en línea — tu comuna base sirve para resultados locales, pero no aparecerás con pin en el mapa.</p>
            </div>
          ) : !form.city ? (
            <p className="text-amber-600 text-sm mt-4">Selecciona primero tu comuna para trazar el mapa.</p>
          ) : (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Ajusta el pin en el mapa:</p>
              <CityMapPicker city={form.city} onCoordinatesChange={(coords) => set('coordinates', coords)} initialCoordinates={form.coordinates} />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Imágenes */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Imágenes</h2>
          <CloudinaryUpload label="Foto principal (opcional)" onUpload={(url) => set('image', url)} multiple={false} />
          <CloudinaryUpload label="Galería (opcional, máx. 8 imágenes)" onUpload={(urls) => set('gallery', urls)} multiple={true} maxFiles={8} />
        </div>
      )}

      {/* Step 4: Confirmar */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Confirmar inscripción</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            {form.image && <img src={form.image} alt={form.name} className="w-full h-40 object-cover rounded-lg mb-3" />}
            <p><strong>Nombre:</strong> {form.name}</p>
            <p><strong>Categoría:</strong> {form.category}</p>
            <p><strong>Comuna:</strong> {form.city} ({form.region})</p>
            <p><strong>Tipo:</strong> {BUSINESS_TYPES.find(t => t.value === form.business_type)?.label}</p>
            <p className="text-gray-500 italic">{form.description.slice(0, 100)}{form.description.length > 100 ? '...' : ''}</p>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer mb-2">
            <input type="checkbox" checked={form.accept_terms} onChange={e => set('accept_terms', e.target.checked)} className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">
              Acepto los{' '}<Link to="/terminos" target="_blank" className="text-blue-600 hover:underline">Términos y condiciones</Link>
              {' '}y la{' '}<Link to="/privacidad" target="_blank" className="text-blue-600 hover:underline">Política de privacidad</Link>.
              Me comprometo a que la información proporcionada es veraz.
            </span>
          </label>

          {!isLoggedIn && (
            <div className="mt-8 p-6 bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl">
               <h3 className="text-lg font-bold text-blue-900 mb-1">
                 {authMode === 'register' ? 'Crea tu cuenta para publicar' : 'Inicia sesión para publicar'}
               </h3>
               <p className="text-sm text-gray-600 mb-5">Necesitamos asociar este emprendimiento a tu usuario para que puedas administrarlo después.</p>
               
               <div className="space-y-4 max-w-sm">
                 {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre o apodo</label>
                      <input type="text" placeholder="Ej: Alejandra" required value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm" />
                    </div>
                 )}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input type="email" placeholder="tu@correo.cl" required value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input type="password" placeholder="********" required value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm" />
                 </div>
                 
                 <div className="mt-4 pt-2 border-t border-gray-100">
                   <button type="button" onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                     {authMode === 'register' ? '¿Ya tienes una cuenta? Inicia sesión' : '¿Eres nuevo? Regístrate gratis'}
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
          ← Anterior
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canProceedStep()}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !canProceedStep()}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {loading ? 'Procesando...' : 'Inscribir emprendimiento'}
          </button>
        )}
      </div>
    </div>
  );
}
