// Capa de datos para Server Components (fetch nativo, server-side).
// Para datos PÚBLICOS (catálogo, ficha, noticias) no se necesita sesión, así que
// llamamos directo al backend FastAPI. En dev apunta a localhost:8000; en prod a
// NEXT_PUBLIC_API_URL (ej. https://api.recomiendopymes.cl/api).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Revalidación ISR por defecto (segundos): la página se sirve estática y se regenera
// cada ~1 min. Se bajó de 300 a 60 para que las acciones de moderación (inactivar un
// negocio) se reflejen pronto en la ficha pública. Trade-off: más regeneraciones.
const DEFAULT_REVALIDATE = 60;

async function apiGet(path, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} en ${path}`);
  return res.json();
}

/**
 * Ficha pública de un negocio por slug.
 * @returns {Promise<{business: object, reviews: object[]} | null>} null si no existe.
 */
export function getBusiness(slug) {
  return apiGet(`/businesses/${encodeURIComponent(slug)}`);
}

/**
 * Listado público de negocios con filtros.
 * @param {{search?:string, city?:string, category?:string, page?:number, limit?:number, nationwide?:boolean}} params
 * @returns {Promise<{businesses:object[], total:number, page:number, total_pages:number}>}
 */
export function getBusinesses(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.city) qs.set('city', params.city);
  if (params.category) qs.set('category', params.category);
  if (params.nationwide) qs.set('nationwide', 'true');
  qs.set('page', String(params.page || 1));
  qs.set('limit', String(params.limit || 12));
  return apiGet(`/businesses?${qs.toString()}`);
}

export async function getCategories() {
  const data = await apiGet('/categories');
  return data?.categories || [];
}

export async function getCities() {
  const data = await apiGet('/cities');
  return data?.cities || [];
}

/** Listado de noticias públicas (publicadas). Devuelve un array. */
export async function getNews(limit = 50) {
  return (await apiGet(`/news/public?limit=${limit}`)) || [];
}

/** Noticia pública por slug. null si no existe/no publicada. */
export function getNewsBySlug(slug) {
  return apiGet(`/news/public/${encodeURIComponent(slug)}`);
}

/** Contenido legal público (key: 'terms' | 'privacy'). Devuelve el Markdown (string). */
export async function getLegal(key) {
  const data = await apiGet(`/legal/${key}`);
  return data?.content || '';
}

/**
 * Todos los negocios activos (paginando; el endpoint capa limit a 500). Para el sitemap.
 * Nota: con catálogos muy grandes conviene un endpoint dedicado de slugs.
 */
export async function getAllActiveBusinesses() {
  const all = [];
  let page = 1;
  for (let i = 0; i < 50; i++) {
    const data = await getBusinesses({ page, limit: 500 });
    const items = data?.businesses || [];
    all.push(...items);
    const totalPages = data?.total_pages || 1;
    if (page >= totalPages || items.length === 0) break;
    page += 1;
  }
  return all;
}
