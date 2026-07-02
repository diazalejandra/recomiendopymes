import { test, expect } from '@playwright/test';

const ARTICLE = 'a[href*="/noticias/"]';

test.describe('Noticias (SEO-crítico)', () => {
  test('el listado de noticias carga', async ({ page }) => {
    await page.goto('/noticias');
    await expect(page.getByRole('heading', { name: /Noticias y Recursos/i })).toBeVisible();
  });

  test('un artículo renderiza con su meta', async ({ page }) => {
    await page.goto('/noticias');
    const count = await page.locator(ARTICLE).count();
    test.skip(count === 0, 'No hay noticias sembradas en la BD de prueba');

    await page.locator(ARTICLE).first().click();
    await expect(page).toHaveURL(/\/noticias\//);
    // NewsDetail fija document.title como `${title} | RecomiendoPymes`.
    await expect(page).toHaveTitle(/RecomiendoPymes/);
  });
});
