import axios from 'axios';

// Cliente para llamadas AUTENTICADAS desde client components. Base SIEMPRE relativa
// '/api': el navegador pega al server Next, que la rewrite-ea al backend (ver
// next.config `API_PROXY_TARGET`). Al ser mismo origen, la cookie de refresh (httpOnly)
// queda en el dominio del front y funciona sin CORS. NO usar una URL absoluta acá: pegar
// directo a api.recomiendopymes.cl sería cross-site y rompería la cookie (requeriría el
// rework de auth diferido). El fetch server-side va aparte, en lib/api.js.
const API_BASE = '/api';

const client = axios.create({ baseURL: API_BASE, withCredentials: true });

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints donde un 401 significa "credenciales inválidas" (no "token expirado"):
// NO debe dispararse el refresh + redirect global; el que llama muestra el error.
// Si no se excluyen, un login con contraseña equivocada intenta refresh, falla y hace
// window.location.href='/login' → saca al usuario de donde esté (p.ej. el wizard de
// /inscribir, perdiendo el formulario). Detectado en el smoke test post-cutover.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

// Si el access token expiró, intentar refresh una vez.
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthPath = original?.url && AUTH_PATHS.some((p) => original.url.includes(p));
    if (error.response?.status === 401 && original && !original._retry && !isAuthPath) {
      original._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        if (typeof window !== 'undefined') localStorage.setItem('access_token', res.data.access_token);
        original.headers.Authorization = `Bearer ${res.data.access_token}`;
        return client(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  getMe: () => client.get('/auth/me').then((r) => r.data),
  updateMe: (data) => client.put('/auth/me', data).then((r) => r.data),
  verifyEmail: (token) => client.get(`/auth/verify-email?token=${token}`).then((r) => r.data),
  resendVerification: () => client.post('/auth/resend-verification').then((r) => r.data),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, new_password) => client.post('/auth/reset-password', { token, new_password }).then((r) => r.data),
};

export const businessApi = {
  list: (params) => client.get('/businesses', { params }).then((r) => r.data),
  get: (slugOrId) => client.get(`/businesses/${slugOrId}`).then((r) => r.data),
  getMine: () => client.get('/businesses/mine').then((r) => r.data),
  create: (data) => client.post('/businesses', data).then((r) => r.data),
  update: (id, data) => client.put(`/businesses/${id}`, data).then((r) => r.data),
  changeStatus: (id, status) => client.patch(`/businesses/${id}/status?new_status=${status}`).then((r) => r.data),
  delete: (id) => client.delete(`/businesses/${id}`).then((r) => r.data),
};

export const reviewApi = {
  list: (businessId, params) => client.get(`/businesses/${businessId}/reviews`, { params }).then((r) => r.data),
  create: (businessId, data) => client.post(`/businesses/${businessId}/reviews`, data).then((r) => r.data),
  addResponse: (reviewId, data) => client.post(`/reviews/${reviewId}/response`, data).then((r) => r.data),
};

export const mediaApi = {
  getUploadSignature: () => client.get('/media/upload-signature').then((r) => r.data),
};

export const metaApi = {
  getCategories: () => client.get('/categories').then((r) => r.data),
  getCities: () => client.get('/cities').then((r) => r.data),
  getLocations: () => client.get('/locations').then((r) => r.data),
};

export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard').then((r) => r.data),
  getBusinesses: (params) => client.get('/admin/businesses', { params }).then((r) => r.data),
  approvesBusiness: (id) => client.patch(`/admin/businesses/${id}/approve`).then((r) => r.data),
  rejectBusiness: (id) => client.patch(`/admin/businesses/${id}/reject`).then((r) => r.data),
  getReviews: (params) => client.get('/admin/reviews', { params }).then((r) => r.data),
  toggleReviewVisibility: (id) => client.patch(`/admin/reviews/${id}/visibility`).then((r) => r.data),
  getUsers: (params) => client.get('/admin/users', { params }).then((r) => r.data),
  toggleUser: (id) => client.patch(`/admin/users/${id}/toggle-active`).then((r) => r.data),
  clearSuspicious: (id) => client.patch(`/admin/users/${id}/clear-suspicious`).then((r) => r.data),
  promoteUser: (id) => client.patch(`/admin/users/${id}/promote`).then((r) => r.data),
  demoteUser: (id) => client.patch(`/admin/users/${id}/demote`).then((r) => r.data),
  getLegal: (key) => client.get(`/admin/legal/${key}`).then((r) => r.data),
  updateLegal: (key, content) => client.put(`/admin/legal/${key}`, { content }).then((r) => r.data),
  getConfig: () => client.get('/admin/config').then((r) => r.data),
  updateConfig: (key, value) => client.put(`/admin/config/${key}`, { value }).then((r) => r.data),
  getNews: (limit = 20) => client.get(`/news/admin?limit=${limit}`).then((r) => r.data),
  createNews: (data) => client.post('/news/', data).then((r) => r.data),
  updateNews: (id, data) => client.patch(`/news/${id}`, data).then((r) => r.data),
  deleteNews: (id) => client.delete(`/news/${id}`).then((r) => r.data),
};

export const newsApi = {
  getPublicNews: (limit = 3) => client.get(`/news/public?limit=${limit}`).then((r) => r.data),
  getBySlug: (slug) => client.get(`/news/public/${slug}`).then((r) => r.data),
};

export default client;

// Extrae un mensaje legible (string) del error de la API. El `detail` de FastAPI puede ser
// un string (HTTPException) o un ARRAY de errores de validación (422). Nunca devolver un
// objeto/array a React (causa el error #31 "objects are not valid as a React child").
export function apiErrorMessage(err, fallback = 'Ocurrió un error. Intenta nuevamente.') {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const msgs = detail.map((e) => (typeof e === 'string' ? e : e?.msg)).filter(Boolean);
    if (msgs.length) return msgs.join('. ');
  }
  return fallback;
}
