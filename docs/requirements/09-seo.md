# Spec — SEO (transversal)

> Estado del spec: **revisado y reconciliado** (decisión central: migrar a Next.js) · Anclado al código a 2026-06-20 (rama `main`)
> Transversal: toca catálogo/negocios, noticias, meta y el shell del frontend.

## Propósito

Hacer que el sitio sea **encontrable en Google** (la propuesta de valor central) y que
sus enlaces se **previsualicen bien al compartir**. Cubre slugs, meta/OpenGraph, datos
estructurados (JSON-LD), sitemap/robots, canonical y la estrategia de **renderizado para
crawlers**.

## Actores

| Actor | Qué necesita |
|---|---|
| Buscador (Google) | Rastrear, renderizar e indexar fichas, artículos y páginas de categoría/ciudad. |
| Scraper social (WhatsApp/FB/Twitter) | Leer los meta OG **sin ejecutar JS**. |
| Visitante | Encontrar el sitio buscando "X en [ciudad]". |
| Fundadora | Rich results (LocalBusiness con geo + rating) y tráfico orgánico. |

## El problema de fondo

El frontend es un **SPA client-rendered** (Vite). Los meta tags y el JSON-LD se inyectan
**por JavaScript** (Helmet en negocios, JS directo en noticias). Consecuencias:
- **Google** puede renderizar JS, pero es **más lento/menos confiable** para indexar.
- **Los scrapers sociales NO ejecutan JS** → al compartir, el preview sale **genérico**
  (es exactamente el bug `og` recurrente del QA, y vuelve en noticias NW-18).

Para un producto cuyo valor **es** el SEO, el renderizado client-side es un handicap real
y la **decisión central** de este módulo.

## Historias de usuario

- **US-1** — Como Google, quiero un `sitemap.xml` y `robots.txt` para descubrir e indexar todo el contenido público.
- **US-2** — Como scraper social, quiero leer los meta OG de cualquier página compartible sin ejecutar JS.
- **US-3** — Como visitante, quiero encontrar páginas tipo "Artesanías en Temuco" en Google (páginas de categoría/ciudad indexables).
- **US-4** — Como fundadora, quiero datos estructurados (LocalBusiness con geo + rating; Article en noticias) para rich results.

## Reglas de negocio

- **RN-1** — Slugs **únicos y estables** (negocios ✅; noticias unificar, NW-2).
- **RN-2** — Cada página pública relevante define `title`, `description` y OG/Twitter dinámicos.
- **RN-3** — Las páginas compartibles entregan sus meta a **crawlers que no ejecutan JS** (SSR / prerender / dynamic rendering).
- **RN-4** — JSON-LD: `LocalBusiness` (con `address` + **geo coordinates** + `aggregateRating`) en fichas; `Article` en noticias.
- **RN-5** — `GET /sitemap.xml` **dinámico** (negocios `active` + noticias `published` + páginas de categoría) y `robots.txt` (apunta al sitemap; bloquea `/admin`, `/mi-negocio`, `/api`).
- **RN-6** — **Canonical** por página; las vistas filtradas por query param canonicalizan a su base (evita contenido duplicado).
- **RN-7** — Páginas de **categoría/ciudad indexables** con URL propia (no solo `?category=`).
- **RN-8** — `lang=es`; cuidar performance / Core Web Vitals (factor de ranking).

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado `/sitemap.xml`, cuando Google lo pide, entonces lista todas las fichas activas y noticias publicadas con sus URLs.
- **CA-2** — Dado `/robots.txt`, cuando un crawler lo pide, entonces ve el sitemap y las rutas privadas bloqueadas.
- **CA-3** — Dada una ficha compartida por WhatsApp, cuando se genera el preview, entonces muestra nombre/descripción/imagen del **negocio** (no el genérico).
- **CA-4** — Dada una ficha, cuando Google la indexa, entonces tiene JSON-LD `LocalBusiness` con `geo` y `aggregateRating`.
- **CA-5** — Dada una noticia, cuando se indexa/comparte, entonces tiene JSON-LD `Article` y preview correcto.
- **CA-6** — Dada una página de categoría/ciudad, cuando se visita, entonces tiene URL propia, title/description únicos y es indexable.
- **CA-7** — Dada una vista filtrada por query param, cuando se indexa, entonces canonicaliza a la base (sin duplicados).

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| Slugs negocios | ✅ | Únicos/auto. |
| Slugs noticias | ⚠️ | Cliente provee, sin unicidad (NW-2). |
| Meta/OG negocios | 🟡 | Helmet con title `nombre — categoría en ciudad` ✅, pero **client-side** (SE-1). |
| Meta/OG noticias | 🟡 | JS directo, client-side (SE-1). |
| JSON-LD `LocalBusiness` | 🟡 | Existe, con address+rating; **falta geo coordinates** (SE-4 / MP-10). |
| JSON-LD `Article` | ❌ | No existe (NW-5). |
| `sitemap.xml` | ❌ | No implementado (SE-2). |
| `robots.txt` | ❌ | No existe (`public/` solo tiene favicons) (SE-2). |
| Canonical | ❌ | No se setea (SE-5). |
| Páginas categoría/ciudad | ❌ | Catálogo filtra por `?category=`, sin URL propia indexable (SE-6). |
| Renderizado para crawlers | ❌ | SPA client-side; scrapers sociales no ven meta (SE-1). |

## Decisión central (2026-06-20)

- **D-1 — Migrar el frontend a Next.js (SSR/SSG/ISR).** Es la base correcta para un producto
  SEO-first; el backend **FastAPI se mantiene** como API. Decisión de fundaciones tomada
  pre-lanzamiento (datos dummy, specs como red de seguridad). **Amerita un ADR.** → SE-1.
  - **Absorbe nativo:** preview social/meta server-side (NW-18), `canonical` (SE-5), JSON-LD
    server-side (SE-4, Article NW-5), `sitemap` (SE-2), páginas categoría/ciudad (SE-6), CWV.
  - **Implica:** rework de auth para SSR (cookies `httpOnly`, no `localStorage`), `dynamic(ssr:false)`
    para Leaflet, migración de routing y data-fetching. No toca modelo de datos ni backend.
- **D-2 — Páginas de categoría y categoría+ciudad** indexables con URL propia (rutas dinámicas en Next). → SE-6.
- **D-3 — Reconciliar categorías**: hoy `/api/categories` es hardcodeado (con "Clothing y Moda"); alinear con la lista curada del módulo 3 (C-1/C-3). → SE-3.

## Backlog derivado

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **SE-1** | Migración del frontend a **Next.js** (SSR/SSG/ISR) | **Alto** | Reescritura del frontend; ADR; rework de auth para SSR; absorbe SE-2/SE-4/SE-5/NW-18 |
| **SE-2** | ✅ `sitemap.xml` dinámico + `robots.txt` | Bajo | **Hecho (2026-07-02, Next).** `app/sitemap.js` (force-dynamic) + `app/robots.js`. Paginación → SE-8 |
| **SE-3** | Categorías desde fuente única (no hardcode) + corregir "Clothing y Moda" | Bajo | Cruce módulo 3 (C-1/C-3) |
| **SE-4** | ✅ `geo` coordinates en JSON-LD `LocalBusiness` + JSON-LD `Article` en noticias | Bajo | **Hecho (2026-07-02, Next).** Cruce MP-10 / NW-5 |
| **SE-5** | ✅ Canonical por página + canonicalización de query params | Bajo | **Hecho (2026-07-02, Next).** `alternates.canonical`; home filtrado canonicaliza a `/` |
| **SE-6** | Páginas de categoría + categoría/ciudad indexables | Medio | Rutas dinámicas; alto valor SEO local |
| **SE-7** | `lang=es`, Core Web Vitals, unificar approach de meta | Bajo | Helmet/metadata en todo, no JS crudo |
| **SE-8** | Paginar el sitemap cuando el catálogo/noticias crezcan | Bajo | Hoy toma noticias con el endpoint público **capado a 50** (negocios ya pagina, cap 500). Con >50 noticias faltarían URLs → endpoint dedicado de slugs o paginación. También fijar `NEXT_PUBLIC_SITE_URL` en Vercel (hoy default `recomiendopymes.cl`) |
| **SE-9** | Invalidación de caché **on-demand** al moderar/editar | Medio | Hoy las páginas públicas son ISR (revalidate 300s) → aprobar/inactivar/ocultar tarda hasta 5 min en reflejarse. Ideal: `revalidateTag`/`revalidatePath` disparado por el cambio de dato (webhook backend→Next o server actions) para reflejo inmediato sin bajar el ISR global. _(detectado 2026-08-03 en QA del admin)_ |

> Muchos SE-* se vuelven triviales o nativos una vez hecha la migración (SE-1); por eso SE-1
> es el habilitador y debería ir primero o junto con el resto.
