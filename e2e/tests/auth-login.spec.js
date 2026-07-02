import { test, expect } from '@playwright/test';

// Usuario sembrado por seed_data.py (credencial de prueba, no de producción).
const SEED_USER = { email: 'maria.gonzalez@gmail.com', password: 'Contrasena123!' };

test.describe('Autenticación', () => {
  test('login con usuario válido deja la sesión iniciada', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill(SEED_USER.email);
    await page.locator('#login-password').fill(SEED_USER.password);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Tras login (no-admin) navega a la home; el header muestra estado autenticado.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: /mis negocios/i })).toBeVisible();
  });

  test('login con credenciales inválidas no inicia sesión', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('nadie@ejemplo.cl');
    await page.locator('#login-password').fill('claveIncorrecta123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Permanece en /login y no aparece el estado autenticado.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('link', { name: /mis negocios/i })).toHaveCount(0);
  });
});
