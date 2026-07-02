# web — Frontend Next.js (App Router)

Migración del frontend a Next.js (ADR-0001). **Convive con `frontend/` (Vite)** hasta el
cutover: mientras se migran las páginas, el SPA actual sigue siendo el que se despliega.

Corre en el **puerto 3001** para no chocar con el Vite (`:3000`).

## Estado: Fase 1 (scaffold)

Montado el andamiaje, sin páginas migradas todavía:
- Next.js App Router + Tailwind v3 (config y tokens **portados 1:1** desde `frontend/`).
- `app/globals.css` con los mismos design tokens; fuente **Outfit** vía `next/font`.
- Shell: `RootLayout` + `Header`/`Footer` (portados desde `AppLayout`).
- Proxy `/api` → backend FastAPI en dev (equivale al proxy de Vite).
- `lib/utils` (`cn`).

Pendiente por fase:
- **Fase 2** — páginas públicas SSR (catálogo, ficha + JSON-LD, noticias) + sitemap/robots/canonical + rutas categoría/ciudad.
- **Fase 3** — páginas privadas (auth, dashboard, admin), Leaflet vía `dynamic(ssr:false)`, wiring de sesión.
- **Fase 4** — cutover en Vercel + retiro del Vite.

> El estado de sesión aún **no** está cableado (el header muestra "no autenticado"); se porta en la Fase 3.

## Correr

```bash
cd web
npm install
npm run dev          # http://localhost:3001
# el backend debe estar en :8000 para las llamadas /api (Fase 2+)
```

## Validar la malla e2e contra este app

```bash
cd ../e2e
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm test
```
