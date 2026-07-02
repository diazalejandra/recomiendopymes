import { test, expect } from '@playwright/test';

const CARD = 'a[href*="/emprendimiento/"]';

test.describe('Catálogo público (SEO-crítico)', () => {
  test('la home muestra el catálogo de negocios', async ({ page }) => {
    await page.goto('/');
    // Las tarjetas se cargan tras el fetch a la API; esperamos a que aparezca al menos una.
    await expect(page.locator(CARD).first()).toBeVisible();
  });

  test('el buscador filtra el catálogo (wiring end-to-end)', async ({ page }) => {
    // Un término imposible debe dejar el catálogo vacío...
    await page.goto('/?search=zxqw-termino-imposible-12345');
    await expect(page.locator(CARD)).toHaveCount(0);

    // ...y sin filtro debe volver a mostrar negocios.
    await page.goto('/');
    await expect(page.locator(CARD).first()).toBeVisible();
  });
});
