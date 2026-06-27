# Spec — Noticias / Blog / Recursos

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-4) · Anclado al código a 2026-06-20 (rama `main`)
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
- **RN-9** — Cada ítem tiene un **tipo**: `hosted` (artículo propio en nuestro dominio, indexable) o `link` (referencia externa curada con `external_url`, abre afuera). _(Resuelve la inconsistencia del `url` externo que ya usa el HomePage.)_
- **RN-10** — **Nunca se republica** contenido externo copiado (anti-duplicado SEO); lo externo se **referencia** (`link`) o se **reescribe** a original. Si se sindica, usar `canonical` al origen.
- **RN-11** — Todo ítem `link`/referenciado **cita su fuente** (atribución).
- **RN-12** — Las **fuentes de contenido son enchufables** (manual, n8n y sugerencias de usuarios ahora; RSS como plug-in **futuro**). Todas caen en una **cola de curación** (draft/link) que el admin aprueba antes de publicar.

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

## Decisiones tomadas (2026-06-20)

- **D-1** — Implementar **publicación programada** (`published_at` futuro se publica solo al llegar la fecha). → NW-4.
- **D-2** — `tag`/sección a **lista controlada** (Noticia, Fondos, Recursos, Historia…). → NW-6.
- **D-3** — Adoptar la visión estratégica: **historias de emprendedores** con enlace a la ficha (NW-8), **recursos evergreen** (NW-9), **difusión por artículo** (NW-10) y **guardrail de contenido IA** (NW-11).
- **D-4** — Fixes confirmados: webhook fail-closed (NW-1), slug único (NW-2), paginación (NW-3), fecha consistente (NW-7), SEO de artículo (NW-5, en módulo SEO).
- **D-5** — **Dos tipos de contenido**: `hosted` (SEO propio) y `link` (referencia externa). → NW-12.
- **D-6** — **Fuentes enchufables**: manual + n8n + sugerencias ahora; **RSS preparado pero no construido** (futuro). → NW-13.
- **D-7** — **Anti-duplicado + canonical** (NW-15) y **atribución de fuente** (NW-16); **directorio de fondos/convocatorias** como contenido `link` estructurado (NW-14).

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **NW-1** | Webhook fail-closed (sin secreto default) | Bajo | Rechazar si `N8N_WEBHOOK_SECRET` no está configurado |
| **NW-2** | Slug único + dedupe en backend | Bajo | Índice único + sufijo (como negocios) |
| **NW-3** | Paginación del listado público | Bajo | `page`/`limit` + total |
| **NW-4** | Publicación programada (`published_at <= now`) | Medio | Filtrar por fecha; setear al programar |
| **NW-5** | JSON-LD `Article` + noticias en el sitemap | Bajo | Se implementa en el módulo SEO |
| **NW-6** | `tag`/sección como lista controlada | Bajo | Secciones fijas; filtrable |
| **NW-7** | Fecha mostrada consistente (`published_at` con fallback) | Bajo | Grid y detalle iguales |
| **NW-8** | Historias de emprendedores con enlace a la ficha | Medio | Comunidad + enlace interno SEO catálogo↔blog |
| **NW-9** | Estructurar "Recursos" evergreen vs noticias puntuales | Bajo-Medio | Mejor SEO a largo plazo |
| **NW-10** | Difusión por artículo (notificación/anuncio + compartir) | Bajo | Cruce AD-21 / NT-7 |
| **NW-11** | Guardrail de contenido IA (solo borradores + edición + foco útil) | Bajo | Proceso + nota; evita penalización SEO |
| **NW-12** | Tipo de contenido `hosted` vs `link` (+ `external_url`) | Medio | Resuelve inconsistencia del `url` del HomePage; render distinto por tipo |
| **NW-13** | Fuentes enchufables: cola de curación (manual, n8n, sugerencias) | Medio | RSS como plug-in **futuro**, no ahora |
| **NW-14** | Directorio de fondos/convocatorias (estructurado: monto, plazo, link) | Medio | Contenido tipo `link`; alto valor para emprendedores |
| **NW-15** | Regla anti-duplicado + `canonical` si se sindica | Bajo | Nunca republicar copia externa |
| **NW-16** | Atribución de fuente en referenciados | Bajo | Citar el origen |

## Fuera de alcance (por ahora) / futuro

- **Ingesta RSS/feeds**: la arquitectura de fuentes queda preparada (NW-13), pero **no se construye la ingesta ahora**. Cuando se haga: cada ítem se vuelve `link` (referencia) o borrador a reescribir — **nunca** copia publicada (RN-10).
