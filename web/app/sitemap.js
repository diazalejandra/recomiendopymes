import { getAllActiveBusinesses, getNews } from '@/lib/api';

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

  const newsRoutes = news.map((n) => ({
    url: `${SITE_URL}/noticias/${n.slug}`,
    lastModified: n.updated_at ? new Date(n.updated_at) : n.published_at ? new Date(n.published_at) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...businessRoutes, ...newsRoutes];
}
