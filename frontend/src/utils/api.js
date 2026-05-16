import axios from 'axios';

// En producción: VITE_API_URL apunta al servidor real
// En desarrollo: usa el proxy de Vite (/api → localhost:8000) para evitar CORS
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL: API_BASE, withCredentials: true });

// Interceptor: agregar Authorization header automáticamente
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: si token expiró, intentar refresh automático
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
  getLocations: () => client.get('/locations').then(r => r.data),
};

// Admin
export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard').then(r => r.data),
  getBusinesses: (params) => client.get('/admin/businesses', { params }).then(r => r.data),
  approvesBusiness: (id) => client.patch(`/admin/businesses/${id}/approve`).then(r => r.data),
  rejectBusiness: (id) => client.patch(`/admin/businesses/${id}/reject`).then(r => r.data),
  getReviews: (params) => client.get('/admin/reviews', { params }).then(r => r.data),
  toggleReviewVisibility: (id) => client.patch(`/admin/reviews/${id}/visibility`).then(r => r.data),
  getUsers: (params) => client.get('/admin/users', { params }).then(r => r.data),
  toggleUser: (id) => client.patch(`/admin/users/${id}/toggle-active`).then(r => r.data),
  clearSuspicious: (id) => client.patch(`/admin/users/${id}/clear-suspicious`).then(r => r.data),
  promoteUser: (id) => client.patch(`/admin/users/${id}/promote`).then(r => r.data),
  getLegal: (key) => client.get(`/admin/legal/${key}`).then(r => r.data),
  updateLegal: (key, content) => client.put(`/admin/legal/${key}`, { content }).then(r => r.data),
  getConfig: () => client.get('/admin/config').then(r => r.data),
  updateConfig: (key, value) => client.put(`/admin/config/${key}`, { value }).then(r => r.data),
  // News endpoints (admin)
  getNews: (limit = 20) => client.get(`/news/admin?limit=${limit}`).then(r => r.data),
  createNews: (data) => client.post('/news/', data).then(r => r.data),
  updateNews: (id, data) => client.patch(`/news/${id}`, data).then(r => r.data),
  deleteNews: (id) => client.delete(`/news/${id}`).then(r => r.data),
};

// News (Public)
export const newsApi = {
  getPublicNews: (limit = 3) => client.get(`/news/public?limit=${limit}`).then(r => r.data),
  getBySlug: (slug) => client.get(`/news/public/${slug}`).then(r => r.data),
};

export default client;