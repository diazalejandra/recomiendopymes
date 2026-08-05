import { defineConfig, devices } from '@playwright/test';

/**
 * Malla fina de e2e para RecomiendoPymes.
 *
 * Es la RED DE SEGURIDAD de la migración a Next.js (ADR-0001): cubre los flujos
 * críticos —sobre todo las páginas públicas SEO— para detectar regresiones. Desde el
 * cutover apunta al **build de producción de Next** (`web/`), no al Vite. Se corre
 * SIEMPRE contra `next build && next start` (nunca `next dev`: compila on-demand y es
 * flaky). Para apuntar a otro target (p.ej. el Vite de fallback) usar `PLAYWRIGHT_BASE_URL`.
 *
 * Requisitos para correr:
 *   1. Backend FastAPI en http://localhost:8000 con MongoDB SEMBRADA (seed_data).
 *   2. web/ YA COMPILADO (`npm --prefix web run build`); Playwright levanta `next start`
 *      en :3001 si no está arriba.
 *
 * Uso local:  (con el backend corriendo, p.ej. vía start.ps1)
 *   cd web && npm run build && cd ../e2e && npm install && npx playwright install chromium && npm test
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Levanta el build de prod de Next (`next start`) si no está corriendo. Requiere
  // web/ ya compilado (`next build`). El BACKEND debe estar arriba aparte (necesita
  // Mongo). En CI se compila web y se orquesta backend+mongo en el workflow.
  // reuseExistingServer siempre: si ya hay un server en el puerto, lo reutiliza.
  webServer: {
    command: 'npm --prefix ../web run start',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
