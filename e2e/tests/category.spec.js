import { test, expect } from '@playwright/test';

// SE-6: páginas de categoría/ciudad. Rutas Next-only (el SPA no las tiene) → auto-skip
// cuando el objetivo no es la app Next (mismo criterio que seo.spec).
async function isNextApp(request) {
  const res = await request.get('/robots.txt');
  if (!res.ok()) return false;
  const body = await res.text();
  return !/<!doctype html|<html/i.test(body);
}

test.describe('Páginas de categoría (SE-6)', () => {
  test('la página de una categoría renderiza con su H1', async ({ page, request }) => {
    test.skip(!(await isNextApp(request)), 'Solo aplica a la app Next (web)');
    await page.goto('/categoria/alimentacion-y-bebidas');
    await expect(page).toHaveURL(/\/categoria\/alimentacion-y-bebidas/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Alimentación y Bebidas/i);
  });

  test('una categoría inexistente devuelve 404', async ({ page, request }) => {
    test.skip(!(await isNextApp(request)), 'Solo aplica a la app Next (web)');
    const res = await page.goto('/categoria/categoria-que-no-existe-xyz');
    expect(res?.status()).toBe(404);
  });
});
