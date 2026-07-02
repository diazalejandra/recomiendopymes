import { defineConfig, devices } from '@playwright/test';

/**
 * Malla fina de e2e para RecomiendoPymes.
 *
 * Es la RED DE SEGURIDAD de la migración a Next.js (ADR-0001): cubre los flujos
 * críticos —sobre todo las páginas públicas SEO— para detectar regresiones al
 * reescribir el frontend. Se corre igual contra el SPA Vite actual y contra el
 * futuro Next.js: solo cambia `PLAYWRIGHT_BASE_URL`.
 *
 * Requisitos para correr:
 *   1. Backend FastAPI en http://localhost:8000 con MongoDB SEMBRADA (seed_data).
 *   2. Frontend en http://localhost:3000 (Playwright lo levanta si no está arriba).
 *
 * Uso local:  (con el backend ya corriendo, p.ej. vía start.ps1)
 *   cd e2e && npm install && npx playwright install chromium && npm test
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

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

  // Levanta el frontend Vite si no está corriendo. El BACKEND debe estar arriba
  // aparte (necesita Mongo). En CI se orquesta backend+mongo en el workflow.
  webServer: {
    command: 'npm --prefix ../frontend run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
