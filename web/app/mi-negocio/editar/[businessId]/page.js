'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { businessApi, metaApi, apiErrorMessage } from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import CityMapPicker from '@/components/business/CityMapPickerDynamic';
import CloudinaryUpload from '@/components/business/CloudinaryUpload';
import AddressAutocomplete from '@/components/business/AddressAutocomplete';

const BUSINESS_TYPES = [
  { value: 'online', label: 'Solo digital (redes sociales, web)' },
  { value: 'physical', label: 'Solo físico (local físico)' },
  { value: 'both', label: 'Mixto (físico y digital)' },
];
const DELIVERY_CARDS = [
  { id: 'home_delivery', icon: '🛵', title: 'Despacho Local', desc: 'Dentro de tu ciudad/comuna' },
  { id: 'nationwide', icon: '✈️', title: 'Envío a todo Chile', desc: 'Vía courier (Starken, etc)' },
  { id: 'store_pickup', icon: '🏪', title: 'Retiro en tienda', desc: 'El cliente va hacia ti' },
  { id: 'meeting_point', icon: '🤝', title: 'Punto de encuentro', desc: 'Zonas céntricas o metro' },
];

function EditBusinessContent() {
  const { businessId } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [regionsData, setRegionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', category: '', description: '', owner: '',
    business_type: 'online', delivery_scope: 'local', delivery_methods: [],
    region: '', city: '', location: '', coordinates: null,
    social_links: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '', email: '' },
    image: '', gallery: [], active_offer: null,
  });

  const [hasOffer, setHasOffer] = useState(false);
  const [offer, setOffer] = useState({ title: '', discount: '', description: '', expires_at: '' });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (form.business_type === 'online' && form.delivery_methods.includes('store_pickup')) {
      set('delivery_methods', form.delivery_methods.filter((m) => m !== 'store_pickup'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.business_type]);

  const toggleDeliveryMethod = (method) => {
    setForm((f) => {
      const methods = f.delivery_methods.includes(method)
        ? f.delivery_methods.filter((m) => m !== method)
        : [...f.delivery_methods, method];
      return { ...f, delivery_methods: methods };
    });
  };

  useEffect(() => {
    Promise.all([
      metaApi.getCategories().catch(() => ({ categories: [] })),
      metaApi.getLocations().catch(() => ({ regions: {} })),
      businessApi.get(businessId).catch(() => null),
    ]).then(([catsData, locationsData, busData]) => {
      setCategories(catsData.categories || []);
      setRegionsData(locationsData.regions || {});
      if (busData && busData.business) {
        const b = busData.business;
        setForm({
          name: b.name || '', category: b.category || '', description: b.description || '', owner: b.owner || '',
          business_type: b.business_type || 'online',
          delivery_scope: b.delivery_scope || 'local',
          delivery_methods: b.delivery_methods || [],
          region: b.region || '', city: b.city || '', location: b.location || '',
          coordinates: b.coordinates || null,
          social_links: b.social_links || { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '', email: '' },
          image: b.image || '', gallery: b.gallery || [], active_offer: b.active_offer || null,
        });
        if (b.active_offer) {
          setHasOffer(true);
          setOffer({
            title: b.active_offer.title || '',
            discount: b.active_offer.discount || '',
            description: b.active_offer.description || '',
            expires_at: b.active_offer.expires_at ? b.active_offer.expires_at.split('T')[0] : '',
          });
        }
      }
      setLoading(false);
    });
  }, [businessId]);

  const sanitizeSocialInput = (key, value) => {
    if (key === 'whatsapp') return value.replace(/[^0-9]/g, '');
    if (key === 'email') return value.trim();
    return value.trim().replace(/\s/g, '');
  };
  const setSocial = (key, value) => setForm((f) => ({ ...f, social_links: { ...f.social_links, [key]: sanitizeSocialInput(key, value) } }));
  const setOfferField = (key, value) => setOffer((o) => ({ ...o, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.city) {
      return toast.error('El nombre, categoría y ciudad son obligatorios.');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (hasOffer && offer.title && offer.discount && offer.expires_at) {
        payload.active_offer = {
          title: offer.title,
          discount: offer.discount,
          description: offer.description,
          expires_at: offer.expires_at + 'T23:59:59.000Z',
        };
      } else {
        payload.active_offer = null;
      }
      await businessApi.update(businessId, payload);
      toast.success('Emprendimiento actualizado exitosamente');
      router.push('/mi-negocio');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Error al actualizar el negocio'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Cargando datos...</div>;

  const showMapStep = form.business_type === 'physical' || form.business_type === 'both';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/mi-negocio" className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Emprendimiento</h1>
          <p className="text-gray-500 text-sm">Actualiza tu vitrina para los clientes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio *</label>
            <select value={form.business_type} onChange={(e) => set('business_type', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Opciones de Entrega</h2>
          <p className="text-sm text-gray-600 mb-2">Selecciona cómo entregas tus productos:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DELIVERY_CARDS.map((opt) => {
              const active = opt.id === 'nationwide' ? form.delivery_scope === 'nationwide' : form.delivery_methods.includes(opt.id);
              const isDisabled = opt.id === 'store_pickup' && form.business_type === 'online';
              return (
                <div
                  key={opt.id}
                  onClick={() => !isDisabled && (opt.id === 'nationwide' ? set('delivery_scope', active ? 'local' : 'nationwide') : toggleDeliveryMethod(opt.id))}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'
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
              );
            })}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Ubicación y Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Región base *</label>
              <select value={form.region} onChange={(e) => { set('region', e.target.value); set('city', ''); }} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Selecciona tu región</option>
                {Object.keys(regionsData).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comuna base *</label>
              <select value={form.city} onChange={(e) => set('city', e.target.value)} disabled={!form.region} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option value="">Selecciona tu comuna</option>
                {(regionsData[form.region] || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección exacta o referencia</label>
              <AddressAutocomplete value={form.location} onChange={(text) => set('location', text)} onSelect={(coords) => set('coordinates', coords)} />
            </div>
          </div>

          {showMapStep && form.city ? (
            <div className="mb-6 border rounded-lg p-2 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2 px-2">Ajusta el pin en el centro comercial / calle exacta:</p>
              <CityMapPicker city={form.city} onCoordinatesChange={(coords) => set('coordinates', coords)} initialCoordinates={form.coordinates} />
            </div>
          ) : !showMapStep && form.city ? (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-blue-700 text-sm">Tu negocio es 100% en línea — tu comuna base sirve para resultados locales, pero no aparecerás con pin en el mapa.</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { key: 'whatsapp', label: '📞 WhatsApp', placeholder: '56912345678' },
              { key: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/miusuario' },
              { key: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/mipagina' },
              { key: 'tiktok', label: '🎵 TikTok', placeholder: 'https://tiktok.com/@miusuario' },
              { key: 'website', label: '🌐 Sitio web', placeholder: 'https://miweb.cl' },
              { key: 'email', label: '✉️ Correo de contacto', placeholder: 'contacto@miemprendimiento.cl' },
              { key: 'youtube', label: '▶️ YouTube', placeholder: 'https://youtube.com/@micanal' },
              { key: 'linkedin', label: '💼 LinkedIn', placeholder: 'https://linkedin.com/company/...' },
              { key: 'twitter', label: '🐦 Twitter / X', placeholder: 'https://x.com/miusuario' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={key === 'email' ? 'email' : key === 'whatsapp' ? 'tel' : 'text'} value={form.social_links[key] || ''} onChange={(e) => setSocial(key, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-orange-200 pb-2">
            <h2 className="text-lg font-bold text-orange-800">Oferta Destacada</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-orange-700">Activar anuncio promocional</span>
              <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-400" checked={hasOffer} onChange={(e) => setHasOffer(e.target.checked)} />
            </label>
          </div>
          {hasOffer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-1">Título de la oferta *</label>
                <input type="text" value={offer.title} onChange={(e) => setOfferField('title', e.target.value)} required={hasOffer} placeholder="Ej: Promo Verano" className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-1">Descuento *</label>
                <input type="text" value={offer.discount} onChange={(e) => setOfferField('discount', e.target.value)} required={hasOffer} placeholder="Ej: 20% OFF ó 2x1" className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-1">Válido hasta *</label>
                <input type="date" value={offer.expires_at} onChange={(e) => setOfferField('expires_at', e.target.value)} required={hasOffer} className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-orange-900 mb-1">Términos / Descripción corta</label>
                <input type="text" value={offer.description} onChange={(e) => setOfferField('description', e.target.value)} placeholder="Menciona restricciones o cupón a usar. Ej: Solo por compras web" className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold border-b pb-2">Logo/Imágenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CloudinaryUpload label="Foto principal *" onUpload={(url) => set('image', url)} multiple={false} initialUrls={form.image ? [form.image] : []} />
            </div>
            <div>
              <CloudinaryUpload label="Galería (máx 8)" onUpload={(urls) => set('gallery', urls)} multiple maxFiles={8} initialUrls={form.gallery} />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-6">
          <Link href="/mi-negocio" className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-50">Cancelar</Link>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditBusinessPage() {
  return (
    <ProtectedRoute>
      <EditBusinessContent />
    </ProtectedRoute>
  );
}
