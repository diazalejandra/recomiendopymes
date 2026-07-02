import { test, expect } from '@playwright/test';

const CARD = 'a[href*="/emprendimiento/"]';

test.describe('Ficha de negocio (SEO-crítico)', () => {
  test('desde la home se navega a una ficha con meta y JSON-LD correctos', async ({ page }) => {
    await page.goto('/');
    await page.locator(CARD).first().click();

    // Debe quedar en la ruta de ficha.
    await expect(page).toHaveURL(/\/emprendimiento\//);

    // Meta: el título dinámico (Helmet hoy; metadata en Next) incluye la marca.
    await expect(page).toHaveTitle(/RecomiendoPymes/);

    // JSON-LD LocalBusiness presente y parseable (rich results / SE-4).
    const ld = page.locator('script#json-ld');
    await expect(ld).toHaveCount(1);
    const raw = await ld.textContent();
    const data = JSON.parse(raw);
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.name).toBeTruthy();
  });

  test('un slug inexistente muestra el estado "no encontrado"', async ({ page }) => {
    await page.goto('/emprendimiento/slug-que-no-existe-999');
    await expect(page.getByText('Emprendimiento no encontrado')).toBeVisible();
  });
});
