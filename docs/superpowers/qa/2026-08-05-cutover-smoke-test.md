# Smoke test post-cutover — Next.js en producción

> Checklist de verificación tras el corte a Next.js (ADR-0001) en `recomiendopymes.cl`.
> Correr en **producción**, desde una **red no corporativa** (la corporativa bloquea el `.cl`).
> Objetivo: confirmar paridad funcional y, sobre todo, que **el SEO server-side quedó bien**
> (que era el motivo de la migración).

## 0. Antes de empezar
- [x] El deploy de Vercel quedó **verde** (Framework Preset = Next.js, Root Directory = `web`).
- [x] Env vars presentes: `API_PROXY_TARGET`, `API_INTERNAL_URL`, `NEXT_PUBLIC_SITE_URL`.
      **Ausente:** `NEXT_PUBLIC_API_URL` (no debe existir).

## 1. Páginas públicas (SSR) cargan
- [x] **Home/catálogo** (`/`): grilla de negocios, filtros por categoría/ciudad, buscador.
- [x] Toggle de vista **Cuadrícula / Lista / Mapa** funciona; el mapa embebido muestra pines.
- [x] **Ficha** (`/emprendimiento/{slug}`): datos, reseñas, mapa de ubicación.
- [x] **Noticias** (`/noticias` y una nota `/noticias/{slug}`). (en /noticias carga, pero no en la parte inferior de la pagina principal)
- [x] **Categoría/ciudad** (`/categoria/{cat}` y `/categoria/{cat}/{ciudad}`).
- [x] **/mapa**: mapa a pantalla con sidebar de filtros.
- [x] **/terminos** y **/privacidad** muestran el contenido legal.

## 2. SEO — lo crítico (el porqué de la migración)
- [x] **Compartir una ficha por WhatsApp** → el preview muestra **nombre + foto + descripción del
      negocio** (NO el genérico). Era el bug recurrente que justificó todo.
- [x] **View-source** de una ficha (Ctrl+U, sin ejecutar JS) contiene:
  - [x] `<title>` y `<meta property="og:*">` con datos reales del negocio.
  - [x] `<link rel="canonical">` correcto.
  - [x] JSON-LD `LocalBusiness` con `geo` (coordenadas) y `aggregateRating`.
- [x] View-source de una **noticia** → JSON-LD `Article`.
- [x] **`/sitemap.xml`** lista fichas activas + noticias + páginas de categoría, con URLs de
      `recomiendopymes.cl` (no `localhost`).
- [x] **`/robots.txt`** apunta al sitemap y bloquea `/admin`, `/mi-negocio`, `/api`.
- [x] **Favicon** visible en la pestaña.

## 3. Autenticación — el punto de mayor riesgo del corte
> El rework de cookies quedó diferido; la sesión depende del **proxy same-origin** de `/api`.
- [x] **Login** con un usuario del seed → entra correctamente.
- [x] **Recargar** la página → la sesión **persiste** (la cookie de refresh funcionó vía proxy).
- [x] **Registro** de un usuario nuevo → llega el email de verificación (o revisar Resend).
- [x] **Cerrar sesión** limpia el estado.

## 4. Flujos privados
- [x] **Inscribir negocio** (`/inscribir`): wizard completo, autocompletado de dirección + pin.
- [x] **Dashboard emprendedor** (`/mi-negocio`): lista, editar, ver reseñas.
- [x] **Admin** (`/admin`): dashboard con métricas; moderación de emprendimientos y reseñas;
      usuarios (promover/degradar/limpiar sospechoso); noticias; legales; configuración
      (2 perillas reales). Link "Ver sitio público" cliqueable.

## 5. Regresión rápida
- [x] Navegación directa a subrutas (ej. pegar `/noticias` en el navegador) **no** da 404.
- [x] Cambiar `boost_days` en `/admin/configuracion` se refleja en el badge "Nuevo" (≤5 min por ISR).

---

## Rollback (si algo crítico falla)
1. Vercel → Root Directory de vuelta a `frontend` (+ Framework Preset a Vite/Other).
2. Redeploy. El Vite (`frontend/` + `VITE_API_URL`) sigue intacto como fallback.

## Al confirmar estabilidad (unos días)
Retirar `frontend/`, su job de CI, `frontend/vercel.json` y la env `VITE_API_URL` de Vercel.
