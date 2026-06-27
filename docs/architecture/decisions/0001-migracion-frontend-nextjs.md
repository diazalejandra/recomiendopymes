# 0001 - Migración del frontend a Next.js (SSR/SSG)

**Fecha:** 2026-06-20
**Estado:** Aceptado

## Contexto

La propuesta de valor central de RecomiendoPymes es **dar visibilidad en Google** a
micro-emprendedores. Sin embargo, el frontend actual es un **SPA client-rendered** (React
+ Vite): los `meta`/OpenGraph y el JSON-LD se inyectan **por JavaScript** (Helmet en
fichas de negocio, JS directo en noticias).

Fuerzas en juego:
- **Los scrapers sociales (WhatsApp/Facebook/Twitter) no ejecutan JS** → al compartir
  cualquier enlace, el preview sale genérico. Es el bug `og` recurrente del QA, que
  reaparece en cada superficie (negocios, noticias).
- **Google** sí renderiza JS, pero la indexación es más lenta y menos confiable que con
  HTML servido; para un producto cuyo único diferenciador es el SEO, es un handicap.
- Faltan piezas SEO base (sitemap, robots, canonical, páginas de categoría/ciudad) que en
  un SPA hay que resolver "a mano" y en un framework SSR son nativas.
- **Momento favorable:** el producto **aún no se lanza** a usuarios reales (datos dummy),
  el frontend es acotado, y se acaba de levantar un set de **specs** que sirven como red
  de seguridad para una reescritura. El costo de migrar es el más bajo que será nunca.
- Ya se despliega en **Vercel** (plataforma nativa de Next.js) y el backend es **FastAPI**
  (API independiente, no se ve afectado).

## Opciones Consideradas

1. **Status quo** — mantener el SPA y confiar en el render JS de Google. Cero trabajo,
   pero el preview social queda roto y el SEO frágil; contradice el valor del producto.
2. **Prerender / dynamic rendering para bots** — servir HTML pre-renderizado solo a
   crawlers. Parche: mantiene dos rutas de render, Google desaconseja el dynamic rendering
   a largo plazo, y no aporta los beneficios globales (CWV, SSG).
3. **Inyección de meta server-side solo para rutas compartibles** — arregla el preview
   social pero no la indexación global ni el rendimiento; solución acotada.
4. **Migrar el frontend a Next.js (SSR/SSG/ISR)** — alinear la arquitectura con la
   propuesta de valor; el backend FastAPI permanece como API.

## Decisión

Migrar el **frontend** a **Next.js** con SSR/SSG/ISR. El **backend FastAPI se mantiene**
como API; Next.js actúa como capa de presentación/BFF que la consume.

## Justificación

- La arquitectura debe **reflejar la propuesta de valor**: un producto SEO-first necesita
  HTML servido, no un SPA.
- Resuelve de forma **nativa** la mayor parte del backlog del módulo SEO: preview social,
  `canonical`, JSON-LD server-side, `sitemap`, páginas de categoría/ciudad (rutas
  dinámicas) y Core Web Vitals.
- Es el **momento más barato** para hacerlo (pre-lanzamiento, datos dummy, specs como red
  de seguridad).
- Encaja con el stack: **Vercel** es nativo para Next.js; **FastAPI no se toca**.

## Consecuencias

- **Positivas:**
  - Preview social correcto e indexación robusta en todas las superficies.
  - SEO base (meta, JSON-LD, canonical, sitemap, páginas categoría/ciudad) nativo o trivial.
  - Mejor rendimiento / Core Web Vitals (factor de ranking).
  - Oportunidad de mover la sesión a cookies `httpOnly` server-side (más seguro que el
    `localStorage` actual).
- **Negativas:**
  - Reescritura del frontend: routing (React Router → App Router), data-fetching
    (`useEffect` → server components/loaders), y **rework del flujo de auth** para SSR.
  - Piezas client-only (Leaflet/mapa) requieren `dynamic(ssr:false)`.
  - Curva de aprendizaje si no hay experiencia previa en Next.js.
- **Riesgos:**
  - Regresiones al reescribir features que hoy funcionan → **mitigado** por los specs de
    `docs/requirements/`.
  - El rework de auth cambia el modelo de sesión (de `localStorage` a cookies `httpOnly`):
    coordinar con el módulo de Auth.
  - Tiempo de migración no trivial; debe planificarse como un esfuerzo dedicado, no
    intercalado con otras tareas.

## Relacionado

- `docs/requirements/09-seo.md` (decisión central SE-1).
- Módulo Auth (`01-auth.md`): el rework de sesión a cookies `httpOnly` se coordina aquí.
- Absorbe/depende de: NW-18 (preview social noticias), SE-2..SE-7.
