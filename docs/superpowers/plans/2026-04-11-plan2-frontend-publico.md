# Plan 2: Frontend Público — Refactor Feature-based + Catálogo + Mapa + Inscripción + SEO

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestructurar el frontend en una arquitectura feature-based, implementar autenticación en el cliente, actualizar el catálogo público con el nuevo ordenamiento y badges, crear la vista de mapa con Leaflet, actualizar el formulario de inscripción multi-paso con upload de imágenes y preview de mapa, e implementar SEO completo en el perfil de cada emprendimiento.

**Architecture:** El frontend pasa de componentes sueltos en `/src/components/` a una estructura `features/` por dominio. `useAuth` context gestiona el estado global de autenticación. Las rutas protegidas usan un componente `ProtectedRoute`. El catálogo existente se migra preservando la lógica — solo se mueve de carpeta y se extiende con los nuevos features.

**Tech Stack:** React 18, React Router v6, Axios, TailwindCSS, Shadcn/ui (existente), react-leaflet + leaflet, @radix-ui/react-*, react-toastify (o sonner)

**Prerrequisito:** Plan 1 (Backend Foundation) completado y servidor corriendo en puerto 8000.

---

## Contexto del codebase frontend actual

Familiarízate antes de empezar:
- `frontend/src/components/HomePage.jsx` — catálogo con filtros y paginación (migrar a features/)
- `frontend/src/components/BusinessCard.jsx` — tarjeta de negocio (migrar)
- `frontend/src/components/BusinessDetail.jsx` — perfil público (migrar + extender)
- `frontend/src/components/ListBusinessPage.jsx` — formulario inscripción (migrar + extender)
- `frontend/src/utils/api.js` — cliente Axios (extender con auth interceptors)
- `frontend/src/App.js` — router actual (reescribir con nuevas rutas)

**NOTA sobre auto_commit:** Revisar `.agent/config.yml`. Si `auto_commit: false`, omitir pasos de commit.

## Inventario de archivos a eliminar (residuos heredados)

Este plan migra los siguientes archivos de `components/` a `features/`. **No borrar hasta que el reemplazo esté funcional** (el Task 12 los elimina todos juntos al final):

| Archivo heredado | Reemplazado por | ¿Conservar? |
|---|---|---|
| `src/components/HomePage.jsx` | `features/catalog/HomePage.jsx` | ❌ Eliminar |
| `src/components/BusinessCard.jsx` | `features/catalog/BusinessCard.jsx` | ❌ Eliminar |
| `src/components/BusinessDetail.jsx` | `features/business/BusinessDetail.jsx` | ❌ Eliminar |
| `src/components/ListBusinessPage.jsx` | `features/business/ListBusinessPage.jsx` | ❌ Eliminar |
| `src/components/ReviewForm.jsx` | `features/business/ReviewForm.jsx` | ❌ Eliminar |
| `src/components/TermsPage.jsx` | `features/catalog/TermsPage.jsx` | ❌ Eliminar |
| `src/components/icons/TikTokIcon.jsx` | Texto plano en botones de redes | ❌ Eliminar |
| `src/App.css` | Estilos en `index.css` | ❌ Eliminar (si no se usa) |
| `src/components/ui/` | Sin cambios — Shadcn UI | ✅ Conservar |
| `src/utils/api.js` | Actualizado (no movido) | ✅ Conservar |

---

## Task 1: Instalar dependencias del frontend

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Instalar nuevos paquetes**

```bash
cd frontend && npm install react-router-dom@^6 axios leaflet react-leaflet @types/leaflet sonner
```

- [ ] **Step 2: Verificar instalación**

```bash
cd frontend && npm list react-leaflet sonner
```

Expected: versiones instaladas sin errores.

---

## Task 2: Restructura de carpetas y archivos base

**Files:**
- Create: `frontend/src/features/catalog/` (directorio)
- Create: `frontend/src/features/business/` (directorio)
- Create: `frontend/src/features/auth/` (directorio)
- Create: `frontend/src/features/entrepreneur/` (directorio)
- Create: `frontend/src/features/admin/` (directorio)
- Create: `frontend/src/hooks/useAuth.js`
- Create: `frontend/src/components/ProtectedRoute.jsx`
- Create: `frontend/src/components/AppLayout.jsx`
- Modify: `frontend/src/utils/api.js`

- [ ] **Step 1: Crear estructura de carpetas**

```bash
mkdir -p frontend/src/features/catalog
mkdir -p frontend/src/features/business
mkdir -p frontend/src/features/auth
mkdir -p frontend/src/features/entrepreneur
mkdir -p frontend/src/features/admin
mkdir -p frontend/src/hooks
```

- [ ] **Step 2: Crear frontend/src/hooks/useAuth.js**

```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    const data = await authApi.register({ email, password, name });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch {}
  };

  // ¿El usuario tiene al menos un negocio? Se determina en la app, no aquí.
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;
  const isEmailVerified = user?.is_email_verified === true;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLoggedIn, isEmailVerified, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
```

- [ ] **Step 3: Crear frontend/src/components/ProtectedRoute.jsx**

```jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

- [ ] **Step 4: Crear frontend/src/components/AppLayout.jsx**

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function AppLayout({ children }) {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary">
              RecomiendoPymes
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/mapa" className="text-sm text-gray-600 hover:text-primary">Mapa</Link>
              <Link to="/inscribir" className="text-sm text-gray-600 hover:text-primary">Inscribir negocio</Link>
              {isLoggedIn ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="text-sm font-medium text-primary">Panel Admin</Link>
                  ) : (
                    <Link to="/mi-negocio" className="text-sm text-gray-600 hover:text-primary">Mis negocios</Link>
                  )}
                  <span className="text-sm text-gray-500">{user?.name}</span>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
                    Salir
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">RecomiendoPymes</h3>
              <p className="text-xs text-gray-500">Catálogo de emprendedores chilenos</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Para emprendedores</h3>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link to="/inscribir" className="hover:text-primary">Inscribir negocio</Link></li>
                <li><Link to="/planes" className="hover:text-primary text-gray-400">Plan Pro (pronto)</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Información</h3>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link to="/terminos" className="hover:text-primary">Términos y condiciones</Link></li>
                <li><Link to="/privacidad" className="hover:text-primary">Política de privacidad</Link></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-8">© {new Date().getFullYear()} RecomiendoPymes. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 5: Actualizar frontend/src/utils/api.js**

```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({ baseURL: API_BASE, withCredentials: true });

// Interceptor: agregar Authorization header automáticamente
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: si token expiró, intentar refresh
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('access_token', res.data.access_token);
        original.headers.Authorization = `Bearer ${res.data.access_token}`;
        return client(original);
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data) => client.post('/auth/register', data).then(r => r.data),
  login: (data) => client.post('/auth/login', data).then(r => r.data),
  logout: () => client.post('/auth/logout').then(r => r.data),
  getMe: () => client.get('/auth/me').then(r => r.data),
  updateMe: (data) => client.put('/auth/me', data).then(r => r.data),
  verifyEmail: (token) => client.get(`/auth/verify-email?token=${token}`).then(r => r.data),
  resendVerification: () => client.post('/auth/resend-verification').then(r => r.data),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token, new_password) => client.post('/auth/reset-password', { token, new_password }).then(r => r.data),
};

// Businesses
export const businessApi = {
  list: (params) => client.get('/businesses', { params }).then(r => r.data),
  get: (slugOrId) => client.get(`/businesses/${slugOrId}`).then(r => r.data),
  getMine: () => client.get('/businesses/mine').then(r => r.data),
  create: (data) => client.post('/businesses', data).then(r => r.data),
  update: (id, data) => client.put(`/businesses/${id}`, data).then(r => r.data),
  changeStatus: (id, status) => client.patch(`/businesses/${id}/status?new_status=${status}`).then(r => r.data),
  delete: (id) => client.delete(`/businesses/${id}`).then(r => r.data),
};

// Reviews
export const reviewApi = {
  list: (businessId, params) => client.get(`/businesses/${businessId}/reviews`, { params }).then(r => r.data),
  create: (businessId, data) => client.post(`/businesses/${businessId}/reviews`, data).then(r => r.data),
  addResponse: (reviewId, data) => client.post(`/reviews/${reviewId}/response`, data).then(r => r.data),
};

// Media
export const mediaApi = {
  getUploadSignature: () => client.get('/media/upload-signature').then(r => r.data),
};

// Meta
export const metaApi = {
  getCategories: () => client.get('/categories').then(r => r.data),
  getCities: () => client.get('/cities').then(r => r.data),
};

// Admin
export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard').then(r => r.data),
  getBusinesses: (params) => client.get('/admin/businesses', { params }).then(r => r.data),
  getReviews: (params) => client.get('/admin/reviews', { params }).then(r => r.data),
  toggleReviewVisibility: (id) => client.patch(`/admin/reviews/${id}/visibility`).then(r => r.data),
  getUsers: (params) => client.get('/admin/users', { params }).then(r => r.data),
  toggleUser: (id) => client.patch(`/admin/users/${id}/toggle-active`).then(r => r.data),
  promoteUser: (id) => client.patch(`/admin/users/${id}/promote`).then(r => r.data),
  getLegal: (key) => client.get(`/admin/legal/${key}`).then(r => r.data),
  updateLegal: (key, content) => client.put(`/admin/legal/${key}`, { content }).then(r => r.data),
  getConfig: () => client.get('/admin/config').then(r => r.data),
  updateConfig: (key, value) => client.put(`/admin/config/${key}`, { value }).then(r => r.data),
};
```

---

## Task 3: App.jsx — Router completo con rutas protegidas

**Files:**
- Modify: `frontend/src/App.js` (o `App.jsx`)

- [ ] **Step 1: Reescribir App.jsx**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Public features
import HomePage from './features/catalog/HomePage';
import MapView from './features/catalog/MapView';
import BusinessDetail from './features/business/BusinessDetail';
import ListBusinessPage from './features/business/ListBusinessPage';

// Auth
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Legal
import TermsPage from './features/catalog/TermsPage';
import PrivacyPage from './features/catalog/PrivacyPage';

// Entrepreneur dashboard
import EntrepreneurDashboard from './features/entrepreneur/Dashboard';
import EditBusiness from './features/entrepreneur/EditBusiness';
import MyReviews from './features/entrepreneur/MyReviews';

// Admin panel
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboard from './features/admin/DashboardPage';
import BusinessesTable from './features/admin/BusinessesTable';
import ReviewsTable from './features/admin/ReviewsTable';
import CategoriesManager from './features/admin/CategoriesManager';
import UsersTable from './features/admin/UsersTable';
import LegalEditor from './features/admin/LegalEditor';
import ConfigPanel from './features/admin/ConfigPanel';

// Placeholder Fase 2
const PlanesPage = () => <div className="p-8 text-center text-gray-500">Plan Pro — próximamente</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Públicas con AppLayout */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/mapa" element={<AppLayout><MapView /></AppLayout>} />
          <Route path="/emprendimiento/:slug" element={<AppLayout><BusinessDetail /></AppLayout>} />
          <Route path="/inscribir" element={<AppLayout><ListBusinessPage /></AppLayout>} />
          <Route path="/terminos" element={<AppLayout><TermsPage /></AppLayout>} />
          <Route path="/privacidad" element={<AppLayout><PrivacyPage /></AppLayout>} />
          <Route path="/planes" element={<AppLayout><PlanesPage /></AppLayout>} />

          {/* Auth (sin AppLayout — tienen su propio diseño centrado) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/verificar-email" element={<VerifyEmailPage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Emprendedor — requiere login */}
          <Route path="/mi-negocio" element={
            <ProtectedRoute><AppLayout><EntrepreneurDashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/mi-negocio/editar/:businessId" element={
            <ProtectedRoute><AppLayout><EditBusiness /></AppLayout></ProtectedRoute>
          } />
          <Route path="/mi-negocio/resenas/:businessId" element={
            <ProtectedRoute><AppLayout><MyReviews /></AppLayout></ProtectedRoute>
          } />

          {/* Admin — requiere role admin */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="emprendimientos" element={<BusinessesTable />} />
            <Route path="resenas" element={<ReviewsTable />} />
            <Route path="categorias" element={<CategoriesManager />} />
            <Route path="usuarios" element={<UsersTable />} />
            <Route path="legal" element={<LegalEditor />} />
            <Route path="configuracion" element={<ConfigPanel />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<AppLayout><div className="p-8 text-center text-gray-500">Página no encontrada</div></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## Task 4: Auth Pages — Login y Registro

**Files:**
- Create: `frontend/src/features/auth/LoginPage.jsx`
- Create: `frontend/src/features/auth/RegisterPage.jsx`
- Create: `frontend/src/features/auth/VerifyEmailPage.jsx`
- Create: `frontend/src/features/auth/ForgotPasswordPage.jsx`
- Create: `frontend/src/features/auth/ResetPasswordPage.jsx`

- [ ] **Step 1: Crear frontend/src/features/auth/LoginPage.jsx**

```jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`¡Bienvenido, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="text-2xl font-bold text-primary block text-center">
            RecomiendoPymes
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-primary hover:text-primary/80">
              Regístrate gratis
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="tu@email.cl"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                id="password" type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Link to="/recuperar-contrasena" className="text-sm text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear frontend/src/features/auth/RegisterPage.jsx**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('¡Cuenta creada! Revisa tu email para verificar tu cuenta.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="text-2xl font-bold text-primary block text-center">RecomiendoPymes</Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">Inicia sesión</Link>
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {[
            { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.cl' },
            { id: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres' },
            { id: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                id={id} name={id} type={type} required
                value={form[id]} onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <p className="text-xs text-center text-gray-500">
            Al registrarte aceptas nuestros{' '}
            <Link to="/terminos" className="text-primary hover:underline">Términos y condiciones</Link>
            {' '}y{' '}
            <Link to="/privacidad" className="text-primary hover:underline">Política de privacidad</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear frontend/src/features/auth/VerifyEmailPage.jsx**

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../utils/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <div className="p-8 text-center">Verificando...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        {status === 'success' ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email verificado!</h2>
            <p className="text-gray-600 mb-6">Ya puedes dejar reseñas en el catálogo.</p>
            <Link to="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
              Ir al catálogo
            </Link>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido o expirado</h2>
            <p className="text-gray-600 mb-6">El enlace de verificación no es válido o ya expiró.</p>
            <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Crear ForgotPasswordPage.jsx y ResetPasswordPage.jsx**

`frontend/src/features/auth/ForgotPasswordPage.jsx`:
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-2">Revisa tu email</h2>
        <p className="text-gray-600">Si el email existe, recibirás las instrucciones. Revisa también tu carpeta de spam.</p>
        <Link to="/login" className="mt-6 inline-block text-primary hover:underline">Volver al inicio de sesión</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recuperar contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-primary">Volver</Link>
        </form>
      </div>
    </div>
  );
}
```

`frontend/src/features/auth/ResetPasswordPage.jsx`:
```jsx
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" disabled={loading || !token}
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## Task 5: Catálogo — Migrar y extender HomePage + BusinessCard

**Files:**
- Create: `frontend/src/features/catalog/HomePage.jsx` (migrar desde components/)
- Create: `frontend/src/features/catalog/BusinessCard.jsx` (migrar + badge Nuevo)

- [ ] **Step 1: Migrar HomePage.jsx a features/catalog/ con soporte para badge Nuevo**

```jsx
// frontend/src/features/catalog/HomePage.jsx
import { useState, useEffect } from 'react';
import { businessApi, metaApi } from '../../utils/api';
import BusinessCard from './BusinessCard';

export default function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(['Todas']);
  const [cities, setCities] = useState(['Todas las ciudades']);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', city: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories));
    metaApi.getCities().then(d => setCities(d.cities));
  }, []);

  useEffect(() => {
    setLoading(true);
    businessApi.list({
      category: filters.category || undefined,
      city: filters.city || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: 12,
    }).then(data => {
      setBusinesses(data.businesses);
      setPagination({ total: data.total, totalPages: data.total_pages });
    }).finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Emprendedores</h1>
        <p className="text-gray-600">Descubre y apoya micro-emprendimientos chilenos</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="search" placeholder="Buscar emprendimientos..." value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select value={filters.category} onChange={e => setFilter('category', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
          {categories.map(c => <option key={c} value={c === 'Todas' ? '' : c}>{c}</option>)}
        </select>
        <select value={filters.city} onChange={e => setFilter('city', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
          {cities.map(c => <option key={c} value={c === 'Todas las ciudades' ? '' : c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl mb-2">No se encontraron emprendimientos</p>
          <p className="text-sm">Prueba con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businesses.map((business, index) => (
              <div key={business.id}>
                {/* Ad slot — Fase 2: cada 8 tarjetas */}
                {/* {index > 0 && index % 8 === 0 && <div className="col-span-full">{/* Ad slot Fase 2 */}{/*</div>} */}
                <BusinessCard business={business} />
              </div>
            ))}
          </div>
          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                ← Anterior
              </button>
              <span className="px-4 py-2 text-gray-600 text-sm">
                Página {filters.page} de {pagination.totalPages}
              </span>
              <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilter('page', filters.page + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crear BusinessCard con badge Nuevo**

```jsx
// frontend/src/features/catalog/BusinessCard.jsx
import { Link } from 'react-router-dom';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">★</span>
      <span className="text-sm font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>
    </div>
  );
}

function isNew(activatedAt, boostDays = 30) {
  if (!activatedAt) return false;
  const activated = new Date(activatedAt);
  const diffDays = (Date.now() - activated.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= boostDays;
}

const BUSINESS_TYPE_LABELS = {
  online: 'En línea',
  physical: 'Presencial',
  both: 'Presencial y en línea',
};

export default function BusinessCard({ business }) {
  const showNewBadge = isNew(business.activated_at) && business.review_count === 0;
  const showFeaturedBadge = business.featured;

  return (
    <Link to={`/emprendimiento/${business.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={business.image || 'https://via.placeholder.com/400x400?text=Sin+imagen'}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges superpuestos */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showFeaturedBadge && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                ✨ Destacado
              </span>
            )}
            {showNewBadge && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                🆕 Nuevo
              </span>
            )}
          </div>
          {business.is_verified && (
            <div className="absolute top-2 right-2">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                ✓ Verificado
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{business.category}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{business.city}</p>
          <div className="flex items-center justify-between mt-2">
            <StarRating rating={business.rating} />
            <span className="text-xs text-gray-400">
              {business.review_count > 0 ? `${business.review_count} reseñas` : 'Sin reseñas aún'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {BUSINESS_TYPE_LABELS[business.business_type] || business.business_type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## Task 6: Vista de Mapa

**Files:**
- Create: `frontend/src/features/catalog/MapView.jsx`
- Create: `frontend/src/index.css` (agregar estilos de Leaflet)

- [ ] **Step 1: Agregar CSS de Leaflet al index.css**

Agregar al inicio de `frontend/src/index.css` (o donde se importen los estilos globales):
```css
@import 'leaflet/dist/leaflet.css';
```

- [ ] **Step 2: Crear frontend/src/features/catalog/MapView.jsx**

```jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { businessApi, metaApi } from '../../utils/api';

// Fix íconos de Leaflet en Vite/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SANTIAGO_CENTER = [-33.4489, -70.6693];

function LocationFinder({ onFound }) {
  const map = useMap();
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 12 });
    map.on('locationfound', (e) => onFound(e.latlng));
    map.on('locationerror', () => {
      map.setView(SANTIAGO_CENTER, 10);
    });
  }, [map, onFound]);
  return null;
}

export default function MapView() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(['Todas']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories));
  }, []);

  useEffect(() => {
    // Cargar todos los negocios físicos/mixtos activos
    businessApi.list({
      category: selectedCategory || undefined,
      limit: 200, // mapas necesitan todos los puntos
    }).then(data => {
      // Filtrar solo físicos o mixtos con coordenadas
      const withCoords = data.businesses.filter(b =>
        (b.business_type === 'physical' || b.business_type === 'both') &&
        b.coordinates
      );
      setBusinesses(withCoords);
    }).finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Controles superpuestos al mapa */}
      <div className="relative z-10 bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
        <h1 className="text-lg font-semibold text-gray-900">Mapa de emprendedores</h1>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value === 'Todas' ? '' : e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
        >
          {categories.map(c => <option key={c} value={c === 'Todas' ? '' : c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-500">
          {loading ? 'Cargando...' : `${businesses.length} negocios físicos en el mapa`}
        </span>
        <span className="text-xs text-gray-400">
          Los negocios 100% online no aparecen en el mapa pero sí en el{' '}
          <Link to="/" className="text-primary hover:underline">catálogo</Link>
        </span>
      </div>

      <MapContainer
        center={SANTIAGO_CENTER} zoom={8}
        style={{ flex: 1 }}
        className="z-0"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationFinder onFound={() => {}} />
        {businesses.map(business => (
          <Marker
            key={business.id}
            position={[business.coordinates.lat, business.coordinates.lng]}
          >
            <Popup className="business-popup">
              <div className="min-w-[200px]">
                {business.image && (
                  <img src={business.image} alt={business.name}
                    className="w-full h-24 object-cover rounded-t mb-2" />
                )}
                <div className="p-1">
                  <span className="text-xs text-primary font-medium uppercase">{business.category}</span>
                  <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
                  <p className="text-xs text-gray-500">{business.city}</p>
                  {business.rating > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">★ {business.rating.toFixed(1)} ({business.review_count} reseñas)</p>
                  )}
                  <Link
                    to={`/emprendimiento/${business.slug}`}
                    className="mt-2 block text-center text-xs bg-primary text-white py-1.5 rounded hover:bg-primary/90"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## Task 7: BusinessDetail actualizado (respuestas a reseñas + SEO + JSON-LD)

**Files:**
- Create: `frontend/src/features/business/BusinessDetail.jsx`
- Create: `frontend/src/features/business/ReviewItem.jsx`
- Create: `frontend/src/features/business/ReviewForm.jsx`

- [ ] **Step 1: Crear ReviewItem.jsx con sección de respuesta**

```jsx
// frontend/src/features/business/ReviewItem.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { reviewApi } from '../../utils/api';
import { toast } from 'sonner';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

export default function ReviewItem({ review, isOwner, onResponseAdded }) {
  const { isLoggedIn } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await reviewApi.addResponse(review._id || review.id, { text: responseText });
      toast.success('Respuesta publicada exitosamente.');
      setShowResponseForm(false);
      if (onResponseAdded) onResponseAdded(updated);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al publicar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  const date = review.date ? new Date(review.date).toLocaleDateString('es-CL', { year:'numeric', month:'long', day:'numeric' }) : '';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{review.reviewer_name}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="text-sm text-gray-700">{review.text}</p>

      {/* Respuesta del emprendedor */}
      {review.response && (
        <div className="mt-3 ml-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Respuesta del emprendedor</p>
          <p className="text-sm text-blue-800">{review.response.text}</p>
          {review.response.date && (
            <p className="text-xs text-blue-400 mt-1">
              {new Date(review.response.date).toLocaleDateString('es-CL')}
            </p>
          )}
        </div>
      )}

      {/* Formulario de respuesta — solo para el dueño y sin respuesta previa */}
      {isOwner && !review.response && isLoggedIn && (
        <div className="mt-3">
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-xs text-primary hover:underline"
            >
              Responder a esta reseña
            </button>
          ) : (
            <form onSubmit={handleSubmitResponse} className="mt-2">
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                required minLength={5} maxLength={500}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {loading ? 'Publicando...' : 'Publicar respuesta'}
                </button>
                <button type="button" onClick={() => setShowResponseForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crear ReviewForm.jsx con verificación de email**

```jsx
// frontend/src/features/business/ReviewForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { reviewApi, authApi } from '../../utils/api';
import { toast } from 'sonner';

export default function ReviewForm({ businessId, onReviewAdded }) {
  const { isLoggedIn, isEmailVerified, refreshUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isLoggedIn) return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
      <p className="text-gray-600 mb-3">¿Quieres dejar una reseña?</p>
      <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
        Inicia sesión
      </Link>
      <Link to="/registro" className="ml-2 text-sm text-primary hover:underline">o regístrate gratis</Link>
    </div>
  );

  if (!isEmailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await authApi.resendVerification();
        toast.success('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      } catch { toast.error('Error al reenviar el email'); }
      finally { setResending(false); }
    };
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm font-medium mb-1">Verifica tu email para dejar comentarios</p>
        <p className="text-amber-700 text-xs mb-3">Te enviamos un enlace de verificación al registrarte. Revisa tu carpeta de spam.</p>
        <button onClick={handleResend} disabled={resending}
          className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50">
          {resending ? 'Reenviando...' : 'Reenviar verificación'}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Selecciona una calificación');
    setLoading(true);
    try {
      const review = await reviewApi.create(businessId, { rating, text });
      toast.success('¡Gracias por tu reseña! Ya está publicada.');
      setRating(0);
      setText('');
      if (onReviewAdded) onReviewAdded(review);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al publicar la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Deja tu reseña</h3>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
            className={`text-2xl transition-colors ${i <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-gray-500 ml-2 self-center">{rating}/5</span>}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Comparte tu experiencia (mínimo 10 caracteres)..."
        required minLength={10} maxLength={500} rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary resize-none"
      />
      <button type="submit" disabled={loading}
        className="w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Publicando...' : 'Publicar reseña'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Crear BusinessDetail.jsx con SEO dinámico + JSON-LD**

```jsx
// frontend/src/features/business/BusinessDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

const SOCIAL_ICONS = {
  instagram: { label: 'Instagram', color: 'bg-pink-500' },
  facebook: { label: 'Facebook', color: 'bg-blue-600' },
  tiktok: { label: 'TikTok', color: 'bg-black' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-500' },
  website: { label: 'Sitio web', color: 'bg-gray-600' },
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-700' },
  twitter: { label: 'Twitter/X', color: 'bg-gray-900' },
  email: { label: 'Email', color: 'bg-indigo-500' },
};

const TYPE_LABELS = { online: 'Negocio en línea', physical: 'Negocio presencial', both: 'Presencial y en línea' };

export default function BusinessDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessApi.get(slug).then(data => {
      setBusiness(data.business);
      setReviews(data.reviews);

      // SEO dinámico
      const b = data.business;
      document.title = `${b.name} — ${b.category} en ${b.city} | RecomiendoPymes`;
      document.querySelector('meta[name="description"]')?.setAttribute('content',
        b.description.slice(0, 160));

      // JSON-LD LocalBusiness
      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": b.name,
        "description": b.description,
        "image": b.image,
        "address": b.location ? {
          "@type": "PostalAddress",
          "addressLocality": b.city,
          "addressCountry": "CL"
        } : undefined,
        "aggregateRating": b.review_count > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": b.rating,
          "reviewCount": b.review_count
        } : undefined,
      };
      let ld = document.getElementById('json-ld');
      if (!ld) {
        ld = document.createElement('script');
        ld.id = 'json-ld';
        ld.type = 'application/ld+json';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(schema);
    }).catch(() => {
      setBusiness(null);
    }).finally(() => setLoading(false));

    return () => {
      document.getElementById('json-ld')?.remove();
      document.title = 'RecomiendoPymes';
    };
  }, [slug]);

  // ¿Es el dueño del negocio el usuario actual?
  const isOwner = user && business?.owner_user_id && String(business.owner_user_id) === String(user.id);

  const handleReviewAdded = (review) => setReviews(prev => [review, ...prev]);
  const handleResponseAdded = (updated) => setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));

  if (loading) return <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  if (!business) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Emprendimiento no encontrado</h2>
      <Link to="/" className="text-primary hover:underline">Volver al catálogo</Link>
    </div>
  );

  const socialLinks = Object.entries(business.social_links || {}).filter(([, v]) => v);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-primary mb-6 inline-block">← Volver al catálogo</Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Imagen principal */}
        <div className="relative h-64 sm:h-80">
          <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {business.featured && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">✨ Destacado</span>}
              {business.is_verified && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">✓ Verificado</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{business.name}</h1>
            <p className="text-sm opacity-80">{business.category} · {business.city}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Rating + info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
            {business.rating > 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <strong className="text-gray-900">{business.rating.toFixed(1)}</strong>
                <span>({business.review_count} reseñas)</span>
              </span>
            ) : <span className="text-gray-400">Sin reseñas aún</span>}
            <span>📍 {business.city}{business.location ? `, ${business.location}` : ''}</span>
            <span>{TYPE_LABELS[business.business_type] || business.business_type}</span>
            {business.established && <span>📅 Desde {business.established}</span>}
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{business.description}</p>

          {/* Redes sociales */}
          {socialLinks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Contáctame</h2>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(([key, url]) => {
                  const info = SOCIAL_ICONS[key] || { label: key, color: 'bg-gray-500' };
                  // Render del link de email como mailto:
  const href = key === 'whatsapp'
    ? `https://wa.me/${url}`
    : key === 'email'
    ? `mailto:${url}`
    : url;
                  return (
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 ${info.color} text-white text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}>
                      {info.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galería */}
      {business.gallery?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Galería</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {business.gallery.map((img, i) => (
              <img key={i} src={img} alt={`${business.name} ${i+1}`} className="aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Reseñas {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
        </h2>
        <div className="space-y-3 mb-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            reviews.map(r => (
              <ReviewItem
                key={r._id || r.id}
                review={r}
                isOwner={isOwner}
                onResponseAdded={handleResponseAdded}
              />
            ))
          )}
        </div>
        {!isOwner && <ReviewForm businessId={business.id} onReviewAdded={handleReviewAdded} />}
      </section>
    </div>
  );
}
```

---

## Task 8: Formulario de inscripción multi-paso con mapa y Cloudinary

**Files:**
- Create: `frontend/src/features/business/ListBusinessPage.jsx`
- Create: `frontend/src/features/business/CityMapPicker.jsx`
- Create: `frontend/src/features/business/CloudinaryUpload.jsx`

- [ ] **Step 1: Crear CityMapPicker.jsx — preview de ubicación con Leaflet**

```jsx
// frontend/src/features/business/CityMapPicker.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix íconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CHILE_CITIES = {
  'Santiago': [-33.4489, -70.6693], 'Valparaíso': [-33.0472, -71.6127],
  'Concepción': [-36.8201, -73.0444], 'Temuco': [-38.7359, -72.5904],
  'La Serena': [-29.9027, -71.2519], 'Antofagasta': [-23.6509, -70.3975],
  'Rancagua': [-34.1708, -70.7444], 'Talca': [-35.4264, -71.6554],
  'Arica': [-18.4783, -70.3126], 'Iquique': [-20.2141, -70.1522],
  'Puerto Montt': [-41.4693, -72.9424], 'Punta Arenas': [-53.1638, -70.9171],
  'Coyhaique': [-45.5712, -72.0688],
};

function PinDragger({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); }
  });
  return position ? <Marker position={position} draggable
    eventHandlers={{ dragend: (e) => { const ll = e.target.getLatLng(); setPosition([ll.lat, ll.lng]); } }}
  /> : null;
}

function MapCenterSetter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13); }, [center, map]);
  return null;
}

export default function CityMapPicker({ city, onCoordinatesChange }) {
  const [position, setPosition] = useState(null);
  const [isExact, setIsExact] = useState(false);
  const cityCoords = city ? CHILE_CITIES[city] || [-33.4489, -70.6693] : [-33.4489, -70.6693];

  useEffect(() => {
    if (city) {
      const coords = CHILE_CITIES[city] || [-33.4489, -70.6693];
      setPosition(coords);
      setIsExact(false);
      onCoordinatesChange({ lat: coords[0], lng: coords[1], is_exact: false });
    }
  }, [city]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    setIsExact(true);
    onCoordinatesChange({ lat: newPos[0], lng: newPos[1], is_exact: true });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        {isExact ? '✅ Ubicación exacta configurada. Puedes arrastrar el pin para ajustar.' : '📍 Pin en el centro de la ciudad. Haz click en el mapa para ubicar tu negocio exactamente (opcional).'}
      </p>
      <div style={{ height: 300 }} className="rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={cityCoords} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterSetter center={cityCoords} />
          <PinDragger position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear CloudinaryUpload.jsx**

```jsx
// frontend/src/features/business/CloudinaryUpload.jsx
import { useState, useRef } from 'react';
import { mediaApi } from '../../utils/api';
import axios from 'axios';

export default function CloudinaryUpload({ label, onUpload, multiple = false, maxFiles = 8 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState([]);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    if (!files.length) return;
    if (multiple && uploaded.length + files.length > maxFiles) {
      alert(`Máximo ${maxFiles} imágenes`);
      return;
    }
    setUploading(true);
    try {
      const sig = await mediaApi.getUploadSignature();
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', sig.signature);
        formData.append('timestamp', sig.timestamp);
        formData.append('api_key', sig.api_key);
        formData.append('folder', sig.folder);
        formData.append('transformation', sig.transformation);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
          formData,
          { onUploadProgress: e => setProgress(Math.round(e.loaded * 100 / e.total)) }
        );
        urls.push(res.data.secure_url);
        setProgress(Math.round((i + 1) * 100 / files.length));
      }
      const newUploaded = multiple ? [...uploaded, ...urls] : urls;
      setUploaded(newUploaded);
      onUpload(multiple ? newUploaded : urls[0]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error al subir la imagen. Intenta nuevamente.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
      >
        <input
          ref={inputRef} type="file" accept="image/*" multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 mx-auto mb-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500">Subiendo... {progress}%</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-2">📸</p>
            <p className="text-sm text-gray-600">Arrastra imágenes aquí o <span className="text-primary">haz click para seleccionar</span></p>
            {multiple && <p className="text-xs text-gray-400 mt-1">Máximo {maxFiles} imágenes</p>}
          </>
        )}
      </div>
      {uploaded.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploaded.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`Subida ${i+1}`} className="w-full aspect-square object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  const newList = uploaded.filter((_, idx) => idx !== i);
                  setUploaded(newList);
                  onUpload(multiple ? newList : null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Crear el formulario multi-paso ListBusinessPage.jsx**

```jsx
// frontend/src/features/business/ListBusinessPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { businessApi, metaApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import CityMapPicker from './CityMapPicker';
import CloudinaryUpload from './CloudinaryUpload';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'online', label: 'Solo en línea (redes sociales, web)' },
  { value: 'physical', label: 'Solo presencial (local físico)' },
  { value: 'both', label: 'Mixto (presencial y en línea)' },
];
const DELIVERY_TYPES = [
  { value: 'nationwide', label: 'Despacho a todo Chile' },
  { value: 'local', label: 'Solo delivery local' },
  { value: 'pickup_only', label: 'Solo retiro en tienda' },
  { value: 'local_and_pickup', label: 'Delivery local y retiro en tienda' },
];

const STEPS = ['Datos básicos', 'Contacto y redes', 'Ubicación', 'Imágenes', 'Confirmar'];

export default function ListBusinessPage() {
  const { isLoggedIn, isEmailVerified } = useAuth();
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
    social_links: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '' },
    image: '', gallery: [],
    accept_terms: false,
  });

  useEffect(() => {
    metaApi.getCategories().then(d => setCategories(d.categories.filter(c => c !== 'Todas')));
    metaApi.getCities().then(d => setCities(d.cities.filter(c => c !== 'Todas las ciudades')));
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setSocial = (key, value) => setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: value } }));

  const canProceedStep = () => {
    if (step === 0) return form.name && form.category && form.description.length >= 10 && form.owner;
    if (step === 1) return !!form.city;
    if (step === 2) return true; // mapa es opcional
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
      // Limpiar social_links vacíos
      Object.keys(data.social_links).forEach(k => { if (!data.social_links[k]) delete data.social_links[k]; });
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
      <p className="text-gray-600 mb-2">Tu emprendimiento <strong>{form.name}</strong> está <strong>pendiente de aprobación</strong>.</p>
      <p className="text-gray-500 text-sm mb-6">Te notificaremos por email cuando sea revisado por nuestro equipo.</p>
      {isLoggedIn && <Link to="/mi-negocio" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 mr-3">Ver mis negocios</Link>}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción * <span className="text-gray-400">({form.description.length}/1000)</span></label>
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
              <input type="text" value={form.social_links[key]} onChange={e => setSocial(key, e.target.value)}
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
          ) : (
            <>
              {!form.city ? (
                <p className="text-amber-600 text-sm">Selecciona primero tu ciudad en el paso anterior.</p>
              ) : (
                <CityMapPicker
                  city={form.city}
                  onCoordinatesChange={(coords) => set('coordinates', coords)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Step 3: Imágenes */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Imágenes</h2>
          <CloudinaryUpload
            label="Foto principal *"
            onUpload={(url) => set('image', url)}
            multiple={false}
          />
          <CloudinaryUpload
            label="Galería (opcional, máx. 8 imágenes)"
            onUpload={(urls) => set('gallery', urls)}
            multiple={true}
            maxFiles={8}
          />
        </div>
      )}

      {/* Step 4: Confirmación */}
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
            <input type="checkbox" checked={form.accept_terms} onChange={e => set('accept_terms', e.target.checked)}
              className="mt-0.5" />
            <span className="text-sm text-gray-700">
              Acepto los{' '}<Link to="/terminos" target="_blank" className="text-primary hover:underline">Términos y condiciones</Link>
              {' '}y la{' '}<Link to="/privacidad" target="_blank" className="text-primary hover:underline">Política de privacidad</Link>.
              Me comprometo a que la información proporcionada es veraz.
            </span>
          </label>
        </div>
      )}

      {/* Navegación entre pasos */}
      <div className="flex justify-between mt-8">
        <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
          ← Anterior
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceedStep()}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40">
            Siguiente →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading || !form.accept_terms}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40">
            {loading ? 'Enviando...' : 'Inscribir emprendimiento'}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Task 9: Páginas legales publicas

**Files:**
- Create: `frontend/src/features/catalog/TermsPage.jsx`
- Create: `frontend/src/features/catalog/PrivacyPage.jsx`

- [ ] **Step 1: Crear TermsPage.jsx y PrivacyPage.jsx (cargan contenido desde la API)**

```jsx
// frontend/src/features/catalog/TermsPage.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Endpoint público para legales
    fetch('/api/admin/legal/terms')
      .then(r => r.json()).then(d => { setContent(d.content); setUpdatedAt(d.updated_at); })
      .catch(() => setContent('Términos y condiciones no disponibles temporalmente.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
      {updatedAt && <p className="text-xs text-gray-400 mb-8">Última actualización: {new Date(updatedAt).toLocaleDateString('es-CL')}</p>}
      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
    </div>
  );
}

// PrivacyPage.jsx — idéntica estructura, key: privacy
export function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/legal/privacy')
      .then(r => r.json()).then(d => setContent(d.content))
      .catch(() => setContent('Política de privacidad no disponible temporalmente.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de privacidad</h1>
      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
    </div>
  );
}

// Conversión Markdown básica (instalar 'marked' si se necesita más robusto)
function markdownToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(.)/gm, (match) => `<p class="mb-4">${match}`)
    .replace(/<\/p><p/g, '</p>\n<p');
}

export default TermsPage;
```

**NOTA:** Crear los dos archivos separados: `TermsPage.jsx` y `PrivacyPage.jsx`, cada uno con su fetch a la key correcta.

---

## Task 10: Meta tags SEO en index.html

**Files:**
- Modify: `frontend/index.html` (o `frontend/public/index.html`)

- [ ] **Step 1: Agregar meta tags base al index.html**

```html
<!-- Agregar dentro de <head> -->
<meta name="description" content="Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile." />
<meta name="keywords" content="emprendedores Chile, catálogo emprendimientos, comprar emprendedores, apoyar pymes Chile" />
<meta property="og:site_name" content="RecomiendoPymes" />
<meta property="og:type" content="website" />
<meta property="og:title" content="RecomiendoPymes — Catálogo de Emprendedores Chilenos" />
<meta property="og:description" content="Descubre y apoya micro-emprendimientos de toda Chile." />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://recomiendopymes.cl" />
```

---

## Task 11: Verificación final del frontend

- [ ] **Step 1: Ejecutar el servidor de desarrollo**

```bash
cd frontend && npm run dev
```

Expected: servidor corriendo en http://localhost:3000

- [ ] **Step 2: Verificar rutas y funcionalidades**

Verificar manualmente:
1. `/` → Catálogo carga, filtros funcionan, badge Nuevo visible en negocios recientes
2. `/emprendimiento/arcilla-viva` → Perfil carga, reseñas visibles, botón de respuesta visible si estás logueado
3. `/mapa` → Mapa carga, pines de negocios físicos visibles, popup con link al perfil
4. `/login` → Login funciona con `usuario@ejemplo.cl` / `password123`
5. `/registro` → Registro crea cuenta y muestra toast de verificación
6. `/inscribir` → Formulario multi-paso navega correctamente
7. `/terminos` / `/privacidad` → Cargan contenido desde la API
8. `/admin` → Redirige a `/login` si no está autenticado; accesible si estás logueado como admin
9. `/mi-negocio` → Redirige a `/login` si no autenticado

- [ ] **Step 3: Commit**

Revisar `.agent/config.yml`. Si `auto_commit: false`, saltar este paso.

```bash
git add frontend/
git commit -m "feat: frontend refactor feature-based + auth + mapa Leaflet + SEO + inscripción multi-paso"
```

---

## Checklist de spec coverage

| Req del spec | Cubierto en |
|---|---|
| Feature-based folder structure | Task 2 |
| useAuth context global | Task 2 |
| ProtectedRoute por rol | Task 2 |
| AppLayout con nav + footer "Para emprendedores" | Task 2 |
| Axios con interceptores auto-auth + refresh | Task 2 |
| Rutas completas (publicas + auth + entrepreneur + admin) | Task 3 |
| Login, Register, VerifyEmail, ForgotPassword, ResetPassword | Task 4 |
| Catálogo con badges Nuevo y Destacado | Task 5 |
| Ordenamiento visual (featured→new→ranked→old) | Task 5 |
| Mapa Leaflet + OpenStreetMap (gratis) | Task 6 |
| Solo negocios físicos/mixtos en el mapa | Task 6 |
| Popup con mini-card al click en pin | Task 6 |
| Filtro de categoría en mapa | Task 6 |
| BusinessDetail con JSON-LD LocalBusiness | Task 7 |
| SEO dinámico (title, meta description, og:image) | Task 7 |
| Respuestas del emprendedor a reseñas | Task 7 |
| ReviewForm con bloqueo por email no verificado | Task 7 |
| Banner "Verifica tu email" + reenvío | Task 7 |
| Toast confirmación al publicar reseña | Task 7 |
| Formulario inscripción multi-paso (5 pasos) | Task 8 |
| Ciudad obligatoria como dropdown | Task 8 |
| CityMapPicker centrado en ciudad seleccionada | Task 8 |
| Ajuste del pin de ubicación (drag) | Task 8 |
| Upload de imágenes real a Cloudinary | Task 8 |
| Estado "pendiente" post-submit con feedback | Task 8 |
| Checkbox T&C obligatorio | Task 8 |
| T&C y Política de Privacidad desde DB editable | Task 9 |
| Meta tags base SEO en index.html | Task 10 |
| Ruta /planes como placeholder | Task 3 |
| Slot anuncio comentado en catálogo | Task 5 |

---

## Task 12: 🧹 Limpieza de código heredado (ejecutar tras verificación Task 11)

**Prerrequisito:** Completar y verificar Tasks 1–11. Todos los nuevos componentes en `features/` deben estar funcionando correctamente antes de eliminar los originales.

**Files:**
- Delete: `frontend/src/components/HomePage.jsx`
- Delete: `frontend/src/components/BusinessCard.jsx`
- Delete: `frontend/src/components/BusinessDetail.jsx`
- Delete: `frontend/src/components/ListBusinessPage.jsx`
- Delete: `frontend/src/components/ReviewForm.jsx`
- Delete: `frontend/src/components/TermsPage.jsx`
- Delete: `frontend/src/components/icons/TikTokIcon.jsx`
- Delete: `frontend/src/components/icons/` (directorio vacío)
- Delete: `frontend/src/App.css` (si ya no se importa en ningún archivo)

- [ ] **Step 1: Verificar que no hay imports pendientes de los archivos heredados**

```bash
# En la raíz del proyecto, buscar imports de los archivos a eliminar
cd frontend && grep -r "from.*components/HomePage" src/ --include="*.jsx" --include="*.js"
grep -r "from.*components/BusinessCard" src/ --include="*.jsx" --include="*.js"
grep -r "from.*components/BusinessDetail" src/ --include="*.jsx" --include="*.js"
grep -r "from.*components/ListBusinessPage" src/ --include="*.jsx" --include="*.js"
grep -r "from.*components/ReviewForm" src/ --include="*.jsx" --include="*.js"
grep -r "from.*components/TermsPage" src/ --include="*.jsx" --include="*.js"
grep -r "TikTokIcon" src/ --include="*.jsx" --include="*.js"
```

Expected: **cero resultados** en todos los comandos. Si aparece algún resultado, actualizar ese archivo primero para que apunte al nuevo path en `features/` antes de continuar.

- [ ] **Step 2: Verificar que App.css no se importa**

```bash
grep -r "App.css" src/ --include="*.jsx" --include="*.js" --include="*.ts"
```

Si da cero resultados: eliminar `App.css`. Si aparece en algún archivo, verificar si el contenido es necesario y migrar los estilos relevantes a `index.css`.

- [ ] **Step 3: Eliminar archivos heredados**

```powershell
# Eliminar componentes migrados a features/
Remove-Item "frontend\src\components\HomePage.jsx" -Force
Remove-Item "frontend\src\components\BusinessCard.jsx" -Force
Remove-Item "frontend\src\components\BusinessDetail.jsx" -Force
Remove-Item "frontend\src\components\ListBusinessPage.jsx" -Force
Remove-Item "frontend\src\components\ReviewForm.jsx" -Force
Remove-Item "frontend\src\components\TermsPage.jsx" -Force
Remove-Item "frontend\src\components\icons\TikTokIcon.jsx" -Force
Remove-Item "frontend\src\components\icons" -Force  # Solo si queda vacío

# Verificar que components/ui/ sigue intacto (NO se elimina)
ls frontend\src\components\ui\
```

Expected: el directorio `components/` solo contiene:
```
components/
  ui/           ← Shadcn UI (conservar)
  AppLayout.jsx ← nuevo (creado en Task 2)
  ProtectedRoute.jsx ← nuevo (creado en Task 2)
```

- [ ] **Step 4: Eliminar App.css si procede**

```powershell
# Solo si el grep del Step 2 dió 0 resultados
Remove-Item "frontend\src\App.css" -Force
```

- [ ] **Step 5: Verificar que el servidor sigue funcionando**

```bash
cd frontend && npm run dev
```

Navegar a `/`, `/mapa`, `/inscribir` y verificar que todo sigue mostrando correctamente sin errores en consola.

- [ ] **Step 6: Commit de limpieza**

Revisar `.agent/config.yml`. Si `auto_commit: false`, saltar este paso.

```bash
git add -u  # stagea los archivos eliminados
git commit -m "chore: eliminar componentes heredados migrados a features/"
```

> **Resultado final:** El directorio `frontend/src/components/` solo contiene `ui/` (Shadcn), `AppLayout.jsx` y `ProtectedRoute.jsx`. No queda ningún código de la arquitectura anterior.
