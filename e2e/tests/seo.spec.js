import { test, expect } from '@playwright/test';

// SE-2: robots.txt + sitemap.xml. Estas rutas SOLO existen en la app Next (web), no en el
// SPA Vite (que responde su index.html como fallback). Por eso los tests se AUTO-SALTAN
// cuando el objetivo no es Next (p. ej. el CI actual, que corre contra el SPA en :3000).
// Cuando el CI cambie al app Next en el cutover, correrán de verdad.
async function servesRobots(request) {
  const res = await request.get('/robots.txt');
  if (!res.ok()) return false;
  const body = await res.text();
  return !/<!doctype html|<html/i.test(body);
}

test.describe('SEO técnico (SE-2)', () => {
  test('robots.txt apunta al sitemap y bloquea rutas privadas', async ({ request }) => {
    test.skip(!(await servesRobots(request)), 'Solo aplica a la app Next (web)');
    const res = await request.get('/robots.txt');
    const body = await res.text();
    expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i);
    expect(body).toContain('/admin');
  });

  test('sitemap.xml lista páginas del sitio', async ({ request }) => {
    test.skip(!(await servesRobots(request)), 'Solo aplica a la app Next (web)');
    const res = await request.get('/sitemap.xml');
    const body = await res.text();
    expect(body).toContain('<urlset');
    // Parte dinámica: debe incluir fichas de negocio.
    expect(body).toContain('/emprendimiento/');
  });
});
