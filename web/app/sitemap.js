import { getAllActiveBusinesses, getNews } from '@/lib/api';
import { toSlug } from '@/lib/slug';

// Generado on-demand (no en build) para no acoplar el deploy a que el backend esté arriba,
// y para reflejar el catálogo/noticias al momento. Los try/catch degradan con gracia:
// si el backend falla, el sitemap igual entrega las rutas estáticas.
export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://recomiendopymes.cl').replace(/\/$/, '');

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/noticias`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ];

  let businesses = [];
  try {
    businesses = await getAllActiveBusinesses();
  } catch {
    businesses = [];
  }

  let news = [];
  try {
    news = await getNews(50);
  } catch {
    news = [];
  }

  const businessRoutes = businesses.map((b) => ({
    url: `${SITE_URL}/emprendimiento/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Páginas de categoría y categoría/ciudad — SOLO las combinaciones que tienen negocios
  // (evita miles de URLs vacías). Derivadas de los negocios activos (SE-6).
  const catSet = new Set();
  const catCitySet = new Set();
  for (const b of businesses) {
    if (b.category) catSet.add(b.category);
    if (b.category && b.city) catCitySet.add(`${b.category}|||${b.city}`);
  }
  const categoryRoutes = [...catSet].map((cat) => ({
    url: `${SITE_URL}/categoria/${toSlug(cat)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  const categoryCityRoutes = [...catCitySet].map((pair) => {
    const [cat, city] = pair.split('|||');
    return {
      url: `${SITE_URL}/categoria/${toSlug(cat)}/${toSlug(city)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  const newsRoutes = news.map((n) => ({
    url: `${SITE_URL}/noticias/${n.slug}`,
    lastModified: n.updated_at ? new Date(n.updated_at) : n.published_at ? new Date(n.published_at) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...categoryCityRoutes, ...businessRoutes, ...newsRoutes];
}
