# Smoke test post-cutover — Next.js en producción

> Checklist de verificación tras el corte a Next.js (ADR-0001) en `recomiendopymes.cl`.
> Correr en **producción**, desde una **red no corporativa** (la corporativa bloquea el `.cl`).
> Objetivo: confirmar paridad funcional y, sobre todo, que **el SEO server-side quedó bien**
> (que era el motivo de la migración).

## 0. Antes de empezar
- [ ] El deploy de Vercel quedó **verde** (Framework Preset = Next.js, Root Directory = `web`).
- [ ] Env vars presentes: `API_PROXY_TARGET`, `API_INTERNAL_URL`, `NEXT_PUBLIC_SITE_URL`.
      **Ausente:** `NEXT_PUBLIC_API_URL` (no debe existir).

## 1. Páginas públicas (SSR) cargan
- [ ] **Home/catálogo** (`/`): grilla de negocios, filtros por categoría/ciudad, buscador.
- [ ] Toggle de vista **Cuadrícula / Lista / Mapa** funciona; el mapa embebido muestra pines.
- [ ] **Ficha** (`/emprendimiento/{slug}`): datos, reseñas, mapa de ubicación.
- [ ] **Noticias** (`/noticias` y una nota `/noticias/{slug}`).
- [ ] **Categoría/ciudad** (`/categoria/{cat}` y `/categoria/{cat}/{ciudad}`).
- [ ] **/mapa**: mapa a pantalla con sidebar de filtros.
- [ ] **/terminos** y **/privacidad** muestran el contenido legal.

## 2. SEO — lo crítico (el porqué de la migración)
- [ ] **Compartir una ficha por WhatsApp** → el preview muestra **nombre + foto + descripción del
      negocio** (NO el genérico). Era el bug recurrente que justificó todo.
- [ ] **View-source** de una ficha (Ctrl+U, sin ejecutar JS) contiene:
  - [ ] `<title>` y `<meta property="og:*">` con datos reales del negocio.
  - [ ] `<link rel="canonical">` correcto.
  - [ ] JSON-LD `LocalBusiness` con `geo` (coordenadas) y `aggregateRating`.
- [ ] View-source de una **noticia** → JSON-LD `Article`.
- [ ] **`/sitemap.xml`** lista fichas activas + noticias + páginas de categoría, con URLs de
      `recomiendopymes.cl` (no `localhost`).
- [ ] **`/robots.txt`** apunta al sitemap y bloquea `/admin`, `/mi-negocio`, `/api`.
- [ ] **Favicon** visible en la pestaña.

## 3. Autenticación — el punto de mayor riesgo del corte
> El rework de cookies quedó diferido; la sesión depende del **proxy same-origin** de `/api`.
- [ ] **Login** con un usuario del seed → entra correctamente.
- [ ] **Recargar** la página → la sesión **persiste** (la cookie de refresh funcionó vía proxy).
- [ ] **Registro** de un usuario nuevo → llega el email de verificación (o revisar Resend).
- [ ] **Cerrar sesión** limpia el estado.

## 4. Flujos privados
- [ ] **Inscribir negocio** (`/inscribir`): wizard completo, autocompletado de dirección + pin.
- [ ] **Dashboard emprendedor** (`/mi-negocio`): lista, editar, ver reseñas.
- [ ] **Admin** (`/admin`): dashboard con métricas; moderación de emprendimientos y reseñas;
      usuarios (promover/degradar/limpiar sospechoso); noticias; legales; configuración
      (2 perillas reales). Link "Ver sitio público" cliqueable.

## 5. Regresión rápida
- [ ] Navegación directa a subrutas (ej. pegar `/noticias` en el navegador) **no** da 404.
- [ ] Cambiar `boost_days` en `/admin/configuracion` se refleja en el badge "Nuevo" (≤5 min por ISR).

---

## Rollback (si algo crítico falla)
1. Vercel → Root Directory de vuelta a `frontend` (+ Framework Preset a Vite/Other).
2. Redeploy. El Vite (`frontend/` + `VITE_API_URL`) sigue intacto como fallback.

## Al confirmar estabilidad (unos días)
Retirar `frontend/`, su job de CI, `frontend/vercel.json` y la env `VITE_API_URL` de Vercel.
