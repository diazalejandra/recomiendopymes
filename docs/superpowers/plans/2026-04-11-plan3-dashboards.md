# Plan 3: Dashboards — Panel Emprendedor + Panel Admin Completo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el dashboard del emprendedor (`/mi-negocio`) para gestionar sus negocios, editar información, subir imágenes y responder reseñas. Implementar el panel de administración completo (`/admin`) con dashboard de métricas, gestión de emprendimientos (aprobar/desactivar), moderación de reseñas, gestión de categorías, usuarios, páginas legales y configuración del sistema.

**Architecture:** El panel admin usa un `AdminLayout.jsx` con sidebar de navegación y `<Outlet />` de React Router para las sub-páginas. Cada sección del admin es un componente independiente. El dashboard del emprendedor vive en `/mi-negocio` con una vista de lista de sus negocios y sub-páginas para edición y reseñas.

**Tech Stack:** React 18, React Router v6 (rutas anidadas), Axios (api.js existente), TailwindCSS, Shadcn/ui

**Prerrequisito:** Plan 1 (Backend) y Plan 2 (Frontend público) completados.

---

## Contexto

Las APIs ya están implementadas en el Plan 1:
- `GET /api/businesses/mine` → mis negocios
- `PUT /api/businesses/:id` → editar negocio
- `PATCH /api/businesses/:id/status` → cambiar estado
- `POST /api/reviews/:id/response` → responder reseña
- `GET /api/admin/dashboard` → métricas
- `GET /api/admin/businesses` → lista admin con filtros
- `GET /api/admin/reviews` → lista de reseñas con filtros
- etc.

**NOTA sobre auto_commit:** Revisar `.agent/config.yml`. Si `auto_commit: false`, omitir pasos de commit.

---

## Task 1: Dashboard Emprendedor — Vista principal

**Files:**
- Create: `frontend/src/features/entrepreneur/Dashboard.jsx`

- [ ] **Step 1: Crear Dashboard.jsx del emprendedor**

```jsx
// frontend/src/features/entrepreneur/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  pending: { label: 'Pendiente de aprobación', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

function BusinessStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState({});

  useEffect(() => {
    businessApi.getMine()
      .then(setBusinesses)
      .catch(() => toast.error('Error al cargar tus negocios'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (businessId, newStatus) => {
    setChangingStatus(s => ({ ...s, [businessId]: true }));
    try {
      const updated = await businessApi.changeStatus(businessId, newStatus);
      setBusinesses(prev => prev.map(b => b.id === businessId || b._id === businessId ? updated : b));
      const messages = {
        inactive: 'Tu emprendimiento ha sido desactivado.',
        pending: 'Solicitud de reactivación enviada. El equipo lo revisará pronto.',
      };
      toast.success(messages[newStatus] || 'Estado actualizado');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al cambiar el estado');
    } finally {
      setChangingStatus(s => ({ ...s, [businessId]: false }));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis emprendimientos</h1>
          <p className="text-sm text-gray-500 mt-1">Hola, {user?.name} 👋</p>
        </div>
        <Link to="/inscribir"
          className="bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90">
          + Agregar negocio
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <p className="text-4xl mb-3">🏪</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes negocios inscritos</h2>
          <p className="text-gray-500 text-sm mb-6">Inscribe tu primer emprendimiento y aparece en el catálogo</p>
          <Link to="/inscribir" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
            Inscribir emprendimiento
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(business => {
            const id = business.id || business._id;
            const status = business.status;
            return (
              <div key={id} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {business.image && (
                    <img src={business.image} alt={business.name}
                      className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{business.name}</h2>
                        <p className="text-sm text-gray-500">{business.category} · {business.city}</p>
                      </div>
                      <BusinessStatusBadge status={status} />
                    </div>

                    {/* Métricas */}
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>⭐ {business.rating > 0 ? business.rating.toFixed(1) : '—'}</span>
                      <span>💬 {business.review_count} reseñas</span>
                      <span>👁️ {business.view_count || 0} visitas</span>
                    </div>

                    {/* Mensaje de estado */}
                    {status === 'pending' && (
                      <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                        Tu emprendimiento está <strong>pendiente de aprobación</strong>. Te notificaremos cuando sea revisado.
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link to={`/mi-negocio/editar/${id}`}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        ✏️ Editar
                      </Link>
                      <Link to={`/mi-negocio/resenas/${id}`}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        💬 Ver reseñas
                      </Link>
                      {status === 'active' && (
                        <Link to={`/emprendimiento/${business.slug}`} target="_blank"
                          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                          👁️ Ver perfil público
                        </Link>
                      )}

                      {/* Acciones de estado */}
                      {status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(id, 'inactive')}
                          disabled={changingStatus[id]}
                          className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
                          {changingStatus[id] ? 'Desactivando...' : 'Desactivar'}
                        </button>
                      )}
                      {status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(id, 'pending')}
                          disabled={changingStatus[id]}
                          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                          {changingStatus[id] ? 'Enviando...' : 'Solicitar reactivación'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Perfil de usuario */}
      <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Mi cuenta</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Nombre:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p>
            <strong>Estado email:</strong>{' '}
            {user?.is_email_verified
              ? <span className="text-green-600">✓ Verificado</span>
              : <span className="text-amber-600">⚠️ Sin verificar</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 2: Dashboard Emprendedor — Editar negocio

**Files:**
- Create: `frontend/src/features/entrepreneur/EditBusiness.jsx`

- [ ] **Step 1: Crear EditBusiness.jsx**

```jsx
// frontend/src/features/entrepreneur/EditBusiness.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import CloudinaryUpload from '../business/CloudinaryUpload';
import CityMapPicker from '../business/CityMapPicker';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'online', label: 'Solo en línea' },
  { value: 'physical', label: 'Solo presencial' },
  { value: 'both', label: 'Presencial y en línea' },
];
const DELIVERY_TYPES = [
  { value: 'nationwide', label: 'Despacho a todo Chile' },
  { value: 'local', label: 'Solo delivery local' },
  { value: 'pickup_only', label: 'Solo retiro en tienda' },
  { value: 'local_and_pickup', label: 'Delivery local y retiro' },
];

export default function EditBusiness() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    businessApi.getMine().then(businesses => {
      const biz = businesses.find(b => (b.id || b._id) === businessId);
      if (!biz) { toast.error('Negocio no encontrado'); navigate('/mi-negocio'); return; }
      setBusiness(biz);
      setForm({
        category: biz.category || '',
        description: biz.description || '',
        owner: biz.owner || '',
        business_type: biz.business_type || 'online',
        delivery_type: biz.delivery_type || 'nationwide',
        established: biz.established || '',
        city: biz.city || '',
        location: biz.location || '',
        coordinates: biz.coordinates || null,
        image: biz.image || '',
        gallery: biz.gallery || [],
        social_links: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '', ...biz.social_links },
      });
    }).finally(() => setLoading(false));
  }, [businessId]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setSocial = (key, value) => setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form };
      Object.keys(data.social_links).forEach(k => { if (!data.social_links[k]) delete data.social_links[k]; });
      await businessApi.update(businessId, data);
      toast.success('Cambios guardados correctamente');
      navigate('/mi-negocio');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mi-negocio" className="text-gray-500 hover:text-primary text-sm">← Mis negocios</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Editar negocio</h1>
      <p className="text-sm text-gray-500 mb-6">{business?.name} — el nombre no es editable</p>

      <div className="space-y-6">
        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
          <input type="text" value={form.owner} onChange={e => set('owner', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400">({form.description.length}/1000)</span></label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={5} maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary resize-none" />
        </div>

        {/* Tipo y entrega */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio</label>
            <select value={form.business_type} onChange={e => set('business_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de entrega</label>
            <select value={form.delivery_type} onChange={e => set('delivery_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              {DELIVERY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
        </div>

        {/* Dirección y mapa */}
        {(form.business_type === 'physical' || form.business_type === 'both') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (opcional)</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="Av. Providencia 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            {form.city && (
              <CityMapPicker city={form.city} onCoordinatesChange={coords => set('coordinates', coords)} />
            )}
          </div>
        )}

        {/* Redes sociales */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Redes sociales</h3>
          <div className="space-y-3">
            {['instagram', 'facebook', 'tiktok', 'whatsapp', 'website', 'email'].map(key => (
              <div key={key}>
                <label className="block text-xs text-gray-600 capitalize mb-1">{key}</label>
                <input type="text" value={form.social_links[key] || ''} onChange={e => setSocial(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Foto principal */}
        <div>
          {form.image && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Foto actual:</p>
              <img src={form.image} alt="Actual" className="h-32 w-32 object-cover rounded-lg" />
            </div>
          )}
          <CloudinaryUpload
            label="Reemplazar foto principal"
            onUpload={url => set('image', url)}
            multiple={false}
          />
        </div>

        {/* Galería */}
        <CloudinaryUpload
          label="Galería (se reemplaza completa)"
          onUpload={urls => set('gallery', urls)}
          multiple={true}
          maxFiles={8}
        />

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link to="/mi-negocio" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 3: Dashboard Emprendedor — Reseñas

**Files:**
- Create: `frontend/src/features/entrepreneur/MyReviews.jsx`

- [ ] **Step 1: Crear MyReviews.jsx**

```jsx
// frontend/src/features/entrepreneur/MyReviews.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewApi, businessApi } from '../../utils/api';
import ReviewItem from '../business/ReviewItem';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function MyReviews() {
  const { businessId } = useParams();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [business, setBusiness] = useState(null);
  const [unreplied, setUnreplied] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reviewApi.list(businessId, { limit: 50 }),
      businessApi.getMine()
    ]).then(([reviewData, businesses]) => {
      setReviews(reviewData.reviews);
      setUnreplied(reviewData.reviews.filter(r => !r.response).length);
      const biz = businesses.find(b => (b.id || b._id) === businessId);
      setBusiness(biz);
    }).catch(() => toast.error('Error al cargar las reseñas'))
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleResponseAdded = (updated) => {
    setReviews(prev => prev.map(r => (r._id || r.id) === (updated._id || updated.id) ? updated : r));
    setUnreplied(prev => Math.max(0, prev - 1));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/mi-negocio" className="text-sm text-gray-500 hover:text-primary mb-4 inline-block">← Mis negocios</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reseñas</h1>
      {business && <p className="text-sm text-gray-500 mb-4">{business.name}</p>}

      {unreplied > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          Tienes <strong>{unreplied} reseña{unreplied > 1 ? 's' : ''}</strong> sin responder.
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">💬</p>
          <p>Aún no tienes reseñas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <ReviewItem
              key={r._id || r.id}
              review={r}
              isOwner={true}
              onResponseAdded={handleResponseAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Task 4: Admin Layout con sidebar

**Files:**
- Create: `frontend/src/features/admin/AdminLayout.jsx`

- [ ] **Step 1: Crear AdminLayout.jsx**

```jsx
// frontend/src/features/admin/AdminLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/emprendimientos', label: '🏪 Emprendimientos' },
  { to: '/admin/resenas', label: '⭐ Reseñas' },
  { to: '/admin/categorias', label: '🏷️ Categorías' },
  { to: '/admin/usuarios', label: '👥 Usuarios' },
  { to: '/admin/legal', label: '📄 Páginas legales' },
  { to: '/admin/configuracion', label: '⚙️ Configuración' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-primary">RecomiendoPymes</h1>
          <p className="text-xs text-gray-500 mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">{user?.name}</p>
          <button onClick={logout} className="text-xs text-red-500 hover:text-red-700">Cerrar sesión</button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Task 5: Admin — Dashboard de métricas

**Files:**
- Create: `frontend/src/features/admin/DashboardPage.jsx`

- [ ] **Step 1: Crear DashboardPage.jsx**

```jsx
// frontend/src/features/admin/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../utils/api';

function MetricCard({ title, value, subtitle, color = 'bg-white', link }) {
  const content = (
    <div className={`${color} rounded-xl p-5 border border-gray-100 shadow-sm`}>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(setMetrics).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!metrics) return <div className="p-8 text-gray-500">Error al cargar métricas</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de la plataforma</p>
      </div>

      {/* Emprendimientos */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Emprendimientos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total" value={metrics.businesses.total} link="/admin/emprendimientos" />
          <MetricCard title="Pendientes" value={metrics.businesses.pending}
            color={metrics.businesses.pending > 0 ? 'bg-yellow-50' : 'bg-white'}
            subtitle={metrics.businesses.pending > 0 ? '⚠️ Requieren revisión' : undefined}
            link="/admin/emprendimientos?status=pending" />
          <MetricCard title="Activos" value={metrics.businesses.active}
            color="bg-green-50" link="/admin/emprendimientos?status=active" />
          <MetricCard title="Nuevos (30 días)" value={metrics.businesses.new_last_30_days} />
        </div>
      </section>

      {/* Usuarios y reseñas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Usuarios</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard title="Total usuarios" value={metrics.users.total} link="/admin/usuarios" />
            <MetricCard title="Nuevos (30 días)" value={metrics.users.new_last_30_days} />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Reseñas</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard title="Total reseñas" value={metrics.reviews.total} link="/admin/resenas" />
            <MetricCard title="Sospechosas" value={metrics.reviews.flagged}
              color={metrics.reviews.flagged > 0 ? 'bg-red-50' : 'bg-white'}
              subtitle={metrics.reviews.flagged > 0 ? '⚠️ Revisar' : undefined}
              link="/admin/resenas?flagged=true" />
          </div>
        </section>
      </div>

      {/* Top categorías */}
      {metrics.top_categories?.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Top categorías</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            {metrics.top_categories.map(cat => (
              <div key={cat.category} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700 flex-1">{cat.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 mx-3">
                  <div className="bg-primary h-2 rounded-full"
                    style={{ width: `${(cat.count / metrics.businesses.active * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{cat.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Task 6: Admin — Gestión de emprendimientos

**Files:**
- Create: `frontend/src/features/admin/BusinessesTable.jsx`

- [ ] **Step 1: Crear BusinessesTable.jsx**

```jsx
// frontend/src/features/admin/BusinessesTable.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = { pending: 'Pendiente', active: 'Activo', inactive: 'Inactivo' };

export default function BusinessesTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const statusFilter = searchParams.get('status') || '';

  const loadBusinesses = () => {
    setLoading(true);
    adminApi.getBusinesses({ status: statusFilter || undefined, page, limit: 20 })
      .then(data => { setBusinesses(data.businesses); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBusinesses(); }, [statusFilter, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`/api/businesses/${id}/status?new_status=${newStatus}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      toast.success(`Estado cambiado a "${STATUS_LABELS[newStatus]}"`);
      loadBusinesses();
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await fetch(`/api/businesses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      toast.success('Emprendimiento eliminado');
      loadBusinesses();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Emprendimientos</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-6">
        {['', 'pending', 'active', 'inactive'].map(s => (
          <button key={s} onClick={() => { setSearchParams(s ? { status: s } : {}); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === s ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {s === '' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negocio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {businesses.map(biz => {
                const id = biz._id || biz.id;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {biz.image && <img src={biz.image} alt={biz.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900">{biz.name}</p>
                          <p className="text-xs text-gray-400">{biz.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{biz.city}</td>
                    <td className="px-4 py-3">
                      {biz.rating > 0
                        ? <span className="text-yellow-600">★ {biz.rating.toFixed(1)}</span>
                        : <span className="text-gray-400 text-xs">Sin reseñas</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[biz.status]}`}>
                        {STATUS_LABELS[biz.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {biz.status === 'pending' && (
                          <button onClick={() => handleStatusChange(id, 'active')}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            ✓ Aprobar
                          </button>
                        )}
                        {biz.status === 'pending' && (
                          <button onClick={() => handleStatusChange(id, 'inactive')}
                            className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                            Rechazar
                          </button>
                        )}
                        {biz.status === 'active' && (
                          <button onClick={() => handleStatusChange(id, 'inactive')}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                            Desactivar
                          </button>
                        )}
                        {biz.status === 'inactive' && (
                          <button onClick={() => handleStatusChange(id, 'active')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                            Activar
                          </button>
                        )}
                        {biz.slug && (
                          <a href={`/emprendimiento/${biz.slug}`} target="_blank" rel="noopener"
                            className="text-xs px-2 py-1 border border-gray-200 text-gray-600 rounded hover:bg-gray-50">
                            👁️
                          </a>
                        )}
                        <button onClick={() => handleDelete(id, biz.name)}
                          className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
          <span className="px-3 py-1.5 text-sm text-gray-500">Pág. {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Siguiente →</button>
        </div>
      )}
    </div>
  );
}
```

---

## Task 7: Admin — Moderación de reseñas

**Files:**
- Create: `frontend/src/features/admin/ReviewsTable.jsx`

- [ ] **Step 1: Crear ReviewsTable.jsx**

```jsx
// frontend/src/features/admin/ReviewsTable.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ReviewsTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const flaggedOnly = searchParams.get('flagged') === 'true';

  const load = () => {
    setLoading(true);
    adminApi.getReviews({ flagged_only: flaggedOnly }).then(data => {
      setReviews(data.reviews);
      setTotal(data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [flaggedOnly]);

  const handleToggle = async (id) => {
    setToggling(t => ({ ...t, [id]: true }));
    try {
      await adminApi.toggleReviewVisibility(id);
      toast.success('Visibilidad actualizada');
      setReviews(prev => prev.map(r => (r._id === id || r.id === id)
        ? { ...r, is_visible: !r.is_visible }
        : r
      ));
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setToggling(t => ({ ...t, [id]: false }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setSearchParams({})}
          className={`px-3 py-1.5 text-sm rounded-lg border ${!flaggedOnly ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
          Todas
        </button>
        <button onClick={() => setSearchParams({ flagged: 'true' })}
          className={`px-3 py-1.5 text-sm rounded-lg border ${flaggedOnly ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
          ⚠️ Sospechosas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => {
            const id = r._id || r.id;
            return (
              <div key={id} className={`bg-white border rounded-xl p-4 ${r.flagged ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{r.reviewer_name}</span>
                      <span className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}</span>
                      {r.flagged && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Sospechosa</span>}
                      {!r.is_visible && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Oculta</span>}
                    </div>
                    <p className="text-sm text-gray-700">{r.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString('es-CL')}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(id)}
                    disabled={toggling[id]}
                    className={`text-xs px-3 py-1.5 rounded-lg flex-shrink-0 ${
                      r.is_visible
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    } disabled:opacity-50`}>
                    {toggling[id] ? '...' : r.is_visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## Task 8: Admin — Categorías, Usuarios, Legal, Config

**Files:**
- Create: `frontend/src/features/admin/CategoriesManager.jsx`
- Create: `frontend/src/features/admin/UsersTable.jsx`
- Create: `frontend/src/features/admin/LegalEditor.jsx`
- Create: `frontend/src/features/admin/ConfigPanel.jsx`

- [ ] **Step 1: Crear CategoriesManager.jsx**

```jsx
// frontend/src/features/admin/CategoriesManager.jsx
import { useState, useEffect } from 'react';
import { metaApi, adminApi } from '../../utils/api';
import { toast } from 'sonner';

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    // Cargamos las categorías como objetos desde la API admin
    fetch('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      .then(r => r.json()).then(d => {
        setCategories((d.categories || []).filter(c => c !== 'Todas'));
      });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ name: newName, icon: newIcon || null })
      });
      toast.success('Categoría creada');
      setNewName(''); setNewIcon('');
      load();
    } catch {
      toast.error('Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h1>
      <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex gap-3">
        <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Nueva categoría"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
        <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Ícono (emoji)"
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50">
          Agregar
        </button>
      </form>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm text-center">No hay categorías. Las categorías se crean automáticamente con los negocios o puedes crearlas manualmente.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-800">{cat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear UsersTable.jsx**

```jsx
// frontend/src/features/admin/UsersTable.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});

  const load = () => {
    setLoading(true);
    adminApi.getUsers().then(data => { setUsers(data.users); setTotal(data.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setActioning(a => ({ ...a, [id]: true }));
    try {
      const result = await adminApi.toggleUser(id);
      toast.success(result.message);
      setUsers(prev => prev.map(u => (u._id === id || u.id === id) ? { ...u, is_active: result.is_active } : u));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    } finally {
      setActioning(a => ({ ...a, [id]: false }));
    }
  };

  const handlePromote = async (id, name) => {
    if (!confirm(`¿Promover a "${name}" como administrador?`)) return;
    setActioning(a => ({ ...a, [id]: true }));
    try {
      await adminApi.promoteUser(id);
      toast.success('Usuario promovido a administrador');
      setUsers(prev => prev.map(u => (u._id === id || u.id === id) ? { ...u, role: 'admin' } : u));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    } finally {
      setActioning(a => ({ ...a, [id]: false }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email 
                verificado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => {
                const id = u._id || u.id;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_email_verified ? <span className="text-green-600 text-xs">✓ Verificado</span> : <span className="text-gray-400 text-xs">Pendiente</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => handleToggle(id)} disabled={actioning[id]}
                              className={`text-xs px-2 py-1 rounded border disabled:opacity-50 ${u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                              {actioning[id] ? '...' : u.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button onClick={() => handlePromote(id, u.name)} disabled={actioning[id]}
                              className="text-xs px-2 py-1 rounded border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50">
                              Promover
                            </button>
                          </>
                        )}
                        {u.role === 'admin' && <span className="text-xs text-gray-400">Admin — sin acciones</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Crear LegalEditor.jsx**

```jsx
// frontend/src/features/admin/LegalEditor.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';

export default function LegalEditor() {
  const [activeKey, setActiveKey] = useState('terms');
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.getLegal(activeKey).then(data => {
      setContent(data.content || '');
      setUpdatedAt(data.updated_at);
    }).finally(() => setLoading(false));
  }, [activeKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateLegal(activeKey, content);
      toast.success('Contenido actualizado correctamente');
      setUpdatedAt(new Date().toISOString());
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Páginas legales</h1>
      <div className="flex gap-2 mb-4">
        {[
          { key: 'terms', label: 'Términos y condiciones' },
          { key: 'privacy', label: 'Política de privacidad' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveKey(key)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${activeKey === key ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>
      {updatedAt && <p className="text-xs text-gray-400 mb-3">Última actualización: {new Date(updatedAt).toLocaleDateString('es-CL')}</p>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2">Edita en formato Markdown. Los cambios se muestran en el sitio público de inmediato.</p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={24}
            className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary resize-none"
          />
          <button onClick={handleSave} disabled={saving}
            className="mt-4 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 self-end">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Crear ConfigPanel.jsx**

```jsx
// frontend/src/features/admin/ConfigPanel.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    adminApi.getConfig().then(data => {
      setConfigs(data);
      const initial = {};
      data.forEach(c => { initial[c.key] = c.value; });
      setEditing(initial);
    });
  }, []);

  const handleSave = async (key) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await adminApi.updateConfig(key, editing[key]);
      toast.success(`Configuración "${key}" actualizada`);
      setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: editing[key] } : c));
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración del sistema</h1>
      <p className="text-sm text-gray-500 mb-6">Parámetros configurables sin necesidad de modificar el código</p>
      <div className="space-y-4">
        {configs.map(cfg => (
          <div key={cfg.key} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-mono text-sm font-medium text-gray-800 mb-0.5">{cfg.key}</p>
                <p className="text-xs text-gray-500 mb-3">{cfg.description}</p>
                <input
                  type="number"
                  value={editing[cfg.key] ?? cfg.value}
                  onChange={e => setEditing(ed => ({ ...ed, [cfg.key]: Number(e.target.value) }))}
                  className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => handleSave(cfg.key)}
                disabled={saving[cfg.key] || editing[cfg.key] === cfg.value}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-40">
                {saving[cfg.key] ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Task 9: Verificación final de los dashboards

- [ ] **Step 1: Iniciar el servidor y verificar flujos completos**

```bash
cd frontend && npm run dev
```

Verificar manualmente con el usuario admin (`admin@recomiendopymes.cl`):

1. `/admin` → Dashboard con métricas visibles
2. `/admin/emprendimientos?status=pending` → Negocio "Naturalia Cosmética" aparece pendiente, botón "Aprobar" funciona
3. Aprobar el negocio → va a `active` y aparece en el catálogo público `/`
4. `/admin/resenas` → Lista de reseñas seed, `toggle` de visibilidad funciona
5. `/admin/usuarios` → Lista de usuarios, desactivar/promover funciona
6. `/admin/legal` → Editor Markdown guarda cambios y se reflejan en `/terminos`
7. `/admin/configuracion` → Parámetros de detección editables

Verificar con usuario de prueba (`usuario@ejemplo.cl` / `password123`):
1. `/mi-negocio` → No tiene negocios → aparece CTA "Inscribir"
2. Inscribir un negocio desde `/inscribir` → aparece en `/mi-negocio` como pendiente
3. Desde admin, aprobar → verificar que aparece en `/mi-negocio` como activo
4. Editar desde `/mi-negocio/editar/:id` → cambios se guardan

- [ ] **Step 2: Commit**

Revisar `.agent/config.yml`. Si `auto_commit: false`, saltar este paso.

```bash
git add frontend/src/features/entrepreneur/ frontend/src/features/admin/
git commit -m "feat: dashboards — panel emprendedor + panel admin completo"
```

---

## Checklist de spec coverage

| Req del spec | Cubierto en |
|---|---|
| Dashboard emprendedor — lista de negocios con estado | Task 1 |
| Badge de estado (pendiente/activo/inactivo) | Task 1 |
| Mensaje "pendiente de aprobación" con feedback | Task 1 |
| Botón Desactivar (active→inactive) | Task 1 |
| Botón Solicitar reactivación (inactive→pending) | Task 1 |
| Métricas básicas por negocio (rating, reseñas, visitas) | Task 1 |
| Perfil de usuario (nombre, email, estado verificación) | Task 1 |
| Editar negocio (todos los campos excepto nombre) | Task 2 |
| Upload de imágenes desde el dashboard | Task 2 |
| Ajuste de ubicación en el mapa desde el dashboard | Task 2 |
| Ver reseñas del negocio en dashboard | Task 3 |
| Responder reseñas desde el dashboard | Task 3 (usa ReviewItem) |
| Badge de reseñas sin responder | Task 3 |
| AdminLayout con sidebar de navegación | Task 4 |
| Dashboard de métricas admin | Task 5 |
| Métricas: negocios por estado, nuevos, usuarios, reseñas | Task 5 |
| Contador de pendientes destacado | Task 5 |
| Top categorías visual | Task 5 |
| Tabla de emprendimientos con filtros de estado | Task 6 |
| Aprobar (pending→active) con un click | Task 6 |
| Rechazar (pending→inactive) | Task 6 |
| Desactivar/activar desde admin | Task 6 |
| Eliminar emprendimiento | Task 6 |
| Tabla de reseñas con filtro "sospechosas" | Task 7 |
| Toggle visibilidad de reseñas | Task 7 |
| Gestión CRUD de categorías | Task 8 |
| Tabla de usuarios con toggle activo/inactivo | Task 8 |
| Cascada visible: desactivar usuario oculta sus reseñas/negocios (backend) | Plan 1 Task 13 |
| Promover usuario a admin | Task 8 |
| Editor Markdown de T&C y Política de Privacidad | Task 8 |
| Panel de configuración de parámetros del sistema | Task 8 |
