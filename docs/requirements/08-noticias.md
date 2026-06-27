# Spec — Noticias / Blog / Recursos

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
> Backend: `modules/news/` · Frontend: `features/news/` (NewsGrid, NewsDetail), `features/admin/NewsPage`

## Propósito

Publicar contenido (noticias, recursos, fondos concursables, historias de
emprendedores) que **informe a la comunidad** y, sobre todo, funcione como **motor de
SEO y adquisición**: contenido útil que rankea en Google y trae tráfico que luego
descubre el catálogo.

## Actores

| Actor | Capacidad |
|---|---|
| Visitante | Leer el listado y los artículos. |
| Admin | Crear/editar/publicar/eliminar artículos (editor Markdown + preview). |
| Sistema (n8n) | Enviar **borradores** auto-generados vía webhook (quedan para revisión). |

## Historias de usuario

- **US-1** — Como visitante, quiero ver el listado de artículos publicados.
- **US-2** — Como visitante, quiero leer un artículo (Markdown) con buen preview al compartir.
- **US-3** — Como admin, quiero crear/editar/publicar/despublicar/eliminar artículos con editor Markdown y vista previa.
- **US-4** — Como sistema (n8n), quiero crear **borradores** auto-generados que el admin revisa antes de publicar.

## Reglas de negocio

- **RN-1** — Solo artículos `published` se muestran al público.
- **RN-2** — El `slug` es **único**, autogenerado del título, con dedupe ante colisión (como en negocios).
- **RN-3** — El webhook requiere un **secreto configurado** (falla cerrado, **sin default**); lo entrante queda como `status: draft`, `source: n8n`.
- **RN-4** — El contenido es Markdown y se renderiza con react-markdown.
- **RN-5** — Cada artículo tiene **SEO**: meta dinámicos + **JSON-LD `Article`** + inclusión en el **sitemap** (cruce SEO).
- **RN-6** — El listado público es **paginado**.
- **RN-7** — El `tag`/sección proviene de una **lista controlada** (ej. Noticia, Fondos, Recursos, Historia), no texto libre.
- **RN-8** — La fecha mostrada es consistente (usar `published_at`, con fallback a `created_at`).

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el listado, cuando lo abro, entonces veo solo `published`, paginados, con fecha consistente.
- **CA-2** — Dado un artículo, cuando lo abro/comparto, entonces el título de pestaña y el preview (OG) reflejan el artículo específico.
- **CA-3** — Dado el admin, cuando creo un artículo, entonces el slug se autogenera y se garantiza **único**.
- **CA-4** — Dado el webhook **sin** secreto configurado, cuando se llama, entonces se rechaza (no hay default que adivinar).
- **CA-5** — Dado un borrador de n8n, cuando llega, entonces queda como draft con badge "IA" y no se publica solo.
- **CA-6** — Dado un slug duplicado, cuando se crea, entonces se deduplica (sufijo) o se rechaza, sin pisar el existente.
- **CA-7** — Dado un artículo publicado, cuando Google lo indexa, entonces tiene JSON-LD `Article` y está en el sitemap.

## Visión estratégica (fuera del alcance actual)

- **E-1 — Blog como motor de adquisición SEO.** Es la palanca de tráfico orgánico top-of-funnel; contenido útil (cómo vender, fondos, logística) que rankea y deriva al catálogo.
- **E-2 — Historias de emprendedores con enlace al perfil.** Artículos que perfilan negocios del catálogo → comunidad, retención de la oferta, shares, y **enlaces internos** que pasan autoridad SEO a las fichas. Sinergia fuerte blog↔catálogo.
- **E-3 — Guardrail de contenido IA.** El pipeline n8n auto-genera contenido; Google penaliza el "scaled content abuse" de baja calidad. Mantener: IA solo para **borradores** + edición humana + foco en contenido **genuinamente útil/original** (no relleno). El badge "IA" ya da transparencia.
- **E-4 — Difusión por artículo.** Publicar un artículo dispara notificación/anuncio y facilita compartir a redes (cruce Notificaciones/difusión AD-21).
- **E-5 — Recursos evergreen vs. noticias.** Separar guías atemporales (rankean a largo plazo) de noticias puntuales; estructurar la sección como "Recursos" además de "Noticias".

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Listado | 🟡 | Publicados ✅; **sin paginación** (NW-3); fecha usa `created_at` (RN-8). |
| US-2 Leer artículo | ✅ | Markdown + meta dinámicos + badge IA. |
| US-3 Admin CRUD | ✅ | Editor Markdown + preview en vivo; auto-slug en el front. |
| US-4 Webhook n8n | 🟡 | Funciona, pero **secreto por defecto** inseguro (NW-1). |
| RN-2 Slug único | ❌ | Cliente provee slug; backend no valida unicidad (NW-2). |
| RN-5 SEO artículo | 🟡 | Meta dinámicos ✅; falta JSON-LD + sitemap (cruce SEO, NW-5). |
| RN-6 Paginación | ❌ | Límite 50 fijo (NW-3). |
| RN-7 Tag controlado | ❌ | `tag` es texto libre (NW-6). |
| RN-8 Fecha consistente | 🟡 | Grid usa `created_at`, detalle `published_at` (NW-7). |
| Publicación programada | ❌ | `published_at` existe pero no se usa para programar (NW-4). |

## Hallazgos / decisiones pendientes

- **NW-1 (seguridad, must-fix)** — Webhook con secreto por defecto. Falla cerrado, sin default. *(fix)*
- **NW-2 (gap)** — Slug único + dedupe en backend. *(fix)*
- **NW-3 (gap)** — Paginación del listado público. *(fix)*
- **NW-4 (decisión)** — `published_at`: ¿implementar **publicación programada** o quitar el campo? *(decisión)*
- **NW-5 (cruce)** — JSON-LD `Article` + sitemap de noticias (módulo SEO).
- **NW-6 (decisión)** — `tag` a **lista controlada** de secciones. *(decisión)*
- **NW-7 (menor)** — Unificar la fecha mostrada (`published_at` con fallback).
- **NW-8 (estratégico)** — Ver Visión estratégica (E-1..E-5): historias de emprendedores, evergreen, difusión, guardrail IA.
