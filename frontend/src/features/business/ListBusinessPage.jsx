import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { businessApi, metaApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import CityMapPicker from './CityMapPicker';
import CloudinaryUpload from './CloudinaryUpload';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'online', label: 'Solo digital (redes sociales, web)' },
  { value: 'physical', label: 'Solo físico (local físico)' },
  { value: 'both', label: 'Mixto (físico y digital)' },
];
const DELIVERY_TYPES = [
  { value: 'nationwide', label: 'Despacho a todo Chile' },
  { value: 'local', label: 'Solo delivery local' },
  { value: 'pickup_only', label: 'Solo retiro en tienda' },
  { value: 'local_and_pickup', label: 'Delivery local y retiro en tienda' },
];

const STEPS = ['Datos básicos', 'Contacto y redes', 'Ubicación', 'Imágenes', 'Confirmar'];

export default function ListBusinessPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', owner: '',
    business_type: 'online', delivery_type: 'nationwide', established: '',
    city: '', location: '', coordinates: null,
    social_links: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '', email: '' },
    image: '', gallery: [],
    accept_terms: false,
  });

  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories)).catch(() => {});
    metaApi.getCities().then(d => setCities(d.cities)).catch(() => {});
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setSocial = (key, value) => setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: value } }));

  const canProceedStep = () => {
    if (step === 0) return form.name && form.category && form.description.length >= 10 && form.owner;
    if (step === 1) return !!form.city;
    if (step === 2) return true;
    if (step === 3) return !!form.image;
    if (step === 4) return form.accept_terms;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.accept_terms) return toast.error('Debes aceptar los términos y condiciones');
    setLoading(true);
    try {
      const data = { ...form };
      delete data.accept_terms;
      Object.keys(data.social_links).forEach(k => {
        if (!data.social_links[k]) delete data.social_links[k];
      });
      await businessApi.create(data);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al inscribir el negocio');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
      <p className="text-gray-600 mb-2">
        Tu emprendimiento <strong>{form.name}</strong> está <strong>pendiente de aprobación</strong>.
      </p>
      <p className="text-gray-500 text-sm mb-6">Te notificaremos por email cuando sea revisado por nuestro equipo.</p>
      {isLoggedIn && (
        <Link to="/mi-negocio" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 mr-3">
          Ver mis negocios
        </Link>
      )}
      <Link to="/" className="text-primary hover:underline">Volver al catálogo</Link>
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
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'} transition-colors`} />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio *</label>
              <select value={form.business_type} onChange={e => set('business_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de entrega *</label>
              <select value={form.delivery_type} onChange={e => set('delivery_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                {DELIVERY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año de fundación</label>
            <input type="text" value={form.established} onChange={e => set('established', e.target.value)}
              placeholder="2020" maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      )}

      {/* Step 1: Contacto y redes */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Contacto y redes sociales</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
            <select value={form.city} onChange={e => set('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecciona tu ciudad</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(form.business_type === 'physical' || form.business_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (opcional)</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="Av. Providencia 1234, Piso 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
          )}
          {[
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tu_usuario' },
            { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tu_pagina' },
            { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@tu_usuario' },
            { key: 'whatsapp', label: 'WhatsApp', placeholder: '56912345678 (sin + ni espacios)' },
            { key: 'website', label: 'Sitio web', placeholder: 'https://tusitio.cl' },
            { key: 'email', label: 'Correo de contacto', placeholder: 'contacto@miemprendimiento.cl' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="text" value={form.social_links[key] || ''} onChange={e => setSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Mapa */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ubicación en el mapa</h2>
          {!showMapStep ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-blue-700 text-sm">Tu negocio es 100% en línea — no aparecerá en el mapa de cercanía, pero sí en el catálogo de lista.</p>
            </div>
          ) : !form.city ? (
            <p className="text-amber-600 text-sm">Selecciona primero tu ciudad en el paso anterior.</p>
          ) : (
            <CityMapPicker city={form.city} onCoordinatesChange={(coords) => set('coordinates', coords)} />
          )}
        </div>
      )}

      {/* Step 3: Imágenes */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Imágenes</h2>
          <CloudinaryUpload label="Foto principal *" onUpload={(url) => set('image', url)} multiple={false} />
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
            <p><strong>Ciudad:</strong> {form.city}</p>
            <p><strong>Tipo:</strong> {BUSINESS_TYPES.find(t => t.value === form.business_type)?.label}</p>
            <p className="text-gray-500 italic">{form.description.slice(0, 100)}{form.description.length > 100 ? '...' : ''}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Estado tras el envío:</strong> Tu emprendimiento quedará <strong>pendiente de aprobación</strong>. Recibirás un email cuando sea revisado por nuestro equipo.
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.accept_terms} onChange={e => set('accept_terms', e.target.checked)} className="mt-0.5" />
            <span className="text-sm text-gray-700">
              Acepto los{' '}<Link to="/terminos" target="_blank" className="text-primary hover:underline">Términos y condiciones</Link>
              {' '}y la{' '}<Link to="/privacidad" target="_blank" className="text-primary hover:underline">Política de privacidad</Link>.
              Me comprometo a que la información proporcionada es veraz.
            </span>
          </label>
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
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40">
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !form.accept_terms}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40">
            {loading ? 'Enviando...' : 'Inscribir emprendimiento'}
          </button>
        )}
      </div>
    </div>
  );
}
