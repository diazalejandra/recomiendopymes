# Spec — SEO (transversal)

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
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

## Hallazgos / decisiones pendientes

- **SE-1 (decisión central)** — Renderizado para crawlers: el SPA sirve meta por JS. ¿Estrategia? *(decisión: SSR/Next, prerender, dynamic rendering, o status quo)*
- **SE-2 (fix)** — Implementar `sitemap.xml` dinámico + `robots.txt`.
- **SE-3 (cruce)** — Categorías servidas **hardcodeadas** en `meta/router.py` (aún con "Clothing y Moda"), no desde DB; afecta páginas de categoría y contradice módulo 3 (C-1/C-3). *(reconciliar)*
- **SE-4 (cruce)** — Agregar **geo coordinates** al JSON-LD `LocalBusiness` (MP-10).
- **SE-5 (fix)** — Canonical por página + canonicalización de query params.
- **SE-6 (decisión)** — Crear **páginas de categoría/ciudad** indexables (alto valor SEO local). *(decisión)*
- **SE-7 (menor)** — `lang=es`, Core Web Vitals, unificar el approach de meta (Helmet en todo, no JS crudo en noticias).
