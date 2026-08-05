# Changelog - RecomiendoPymes

Todos los cambios notables de este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Unreleased] - En Desarrollo

### Migración a Next.js (ADR-0001) — cutover
- Frontend reescrito en **Next.js (App Router)** en `web/`: páginas públicas SSR/ISR
  (catálogo, ficha con JSON-LD `LocalBusiness`+geo, noticias con `Article`, categoría/ciudad,
  sitemap/robots, canonical), auth, reseñas, inscripción, dashboard, panel admin y mapa.
- **Cutover in-place** en Vercel: el proyecto pasa a servir `web/` (Next); el Vite
  (`frontend/`) queda como **fallback temporal**. Ruteo nativo de Next (sin `vercel.json` de SPA).
- **API same-origin:** el cliente usa `/api` relativo proxeado por Next (`API_PROXY_TARGET`),
  preservando la cookie de refresh sin rework de auth. El fetch server-side usa `API_INTERNAL_URL`
  (server-only). Ver `docs/PRODUCTION_ENV_GUIDE.md`.
- **Config admin reconciliada:** whitelist reducida a claves reales (`review_rate_limit`,
  `boost_days`); `boost_days` ahora se consume de verdad (badge "Nuevo" + orden vía `is_new`
  calculado en backend, fuente única).
- **e2e** repuntado al build de prod de Next (`web/`), no al Vite dev.

> ⚠️ **Pendiente de producción (no es código):** la entrega de emails de verificación
> (bug #4 del QA) sigue sin funcionar hasta verificar el dominio `recomiendopymes.cl`
> en Resend (SPF/DKIM) y apuntar `FRONTEND_URL` al dominio real. Bloquea reseñas
> autenticadas y recuperación de contraseña. Ver `docs/PRODUCTION_ENV_GUIDE.md`.

## [1.1.0] - 2026-06-19

Estabilización y endurecimiento para producción. Reconcilia el historial: las entradas
que antes vivían en `[Unreleased]` se consolidan aquí junto con el batch de hardening.

### Añadido
- Filtro global de "Envíos nacionales" en el catálogo (ahora visible sin ciudad seleccionada).
- SEO dinámico por negocio con `react-helmet-async` (`HelmetProvider`): meta tags y OpenGraph reales para previsualizaciones en redes.
- Auto-zoom dinámico (`fitBounds`) en el mapa; el mapa ahora respeta los filtros de búsqueda, categoría y envío nacional.
- Rate limiting por IP (`slowapi`) en registro y recuperación de contraseña.
- Cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`).
- Dependencia `get_current_user_optional` para endpoints con autenticación opcional.
- Modo desarrollo que imprime los enlaces de verificación/reset en consola cuando falta `RESEND_API_KEY`.
- Variable `ENVIRONMENT` y `CLAUDE.md` + base de conocimientos en `docs/` (architecture, requirements, changelog, guía de producción).

### Cambiado
- El formulario de inscripción permite la creación opcional de la foto principal.
- (Revertido) Se mantuvo la obligatoriedad de Región y Comuna en el registro de negocios para preservar la integridad de datos base.
- Cookies de refresh `Secure` controladas por entorno (`COOKIE_SECURE`); docs/redoc ocultas en producción.
- Envío de emails de forma asíncrona (`asyncio.to_thread`) para no bloquear el event loop.
- Las tarjetas de noticias enlazan a la ruta interna `/noticias/:slug`.
- Cliente Mongo con `tz_aware=True`; todos los `datetime` migrados a tz-aware (`datetime.now(timezone.utc)`).

### Seguridad
- Los negocios en estado `pending`/`inactive` solo son visibles por su dueño o un admin; el resto recibe 404.
- Validación de longitud máxima en los query params de búsqueda del catálogo.

### Solucionado
- Error 404 en subrutas de Vercel (`vercel.json` con rewrites). _(bug #3 del QA)_
- Error 404 del `favicon.ico`. _(bug #1 del QA)_
- `og:description` genérico → descripción específica del negocio. _(bug #5 del QA)_
- Observación C6: el mapa no prefiltraba según los filtros de la izquierda.
- Eliminado código muerto (`backend_test.py`, hooks `use-toast`/`useInfiniteScroll`/`useWindowSize`, `toaster.jsx`) y warning de deprecación de `datetime.utcnow()`.
