import { test, expect } from '@playwright/test';

// SE-2: robots.txt + sitemap.xml. Solo aplican a la app Next (web), no al SPA Vite.
test.describe('SEO técnico (SE-2)', () => {
  test('robots.txt apunta al sitemap y bloquea rutas privadas', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i);
    expect(body).toContain('/admin');
  });

  test('sitemap.xml lista páginas del sitio', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('<urlset');
    // Debe incluir fichas de negocio (parte dinámica del sitemap).
    expect(body).toContain('/emprendimiento/');
  });
});
