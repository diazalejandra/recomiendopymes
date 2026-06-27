# Spec — Imágenes / Media (transversal)

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-3) · Anclado al código a 2026-06-20 (rama `main`)
> Backend: `modules/media/` · Frontend: `features/business/CloudinaryUpload.jsx`

## Propósito

Gestionar la carga y entrega de imágenes (foto principal y galería de negocios; a futuro
noticias) de forma eficiente y económica: subida **directa a Cloudinary** con firma del
servidor, sin que el binario pase por el backend, y entrega optimizada (resize, WebP).

## Actores

| Actor | Capacidad |
|---|---|
| Usuario/Dueño | Subir/quitar imágenes de su negocio (principal + galería). |
| Admin | Imágenes en noticias (hoy por URL — ver NW-17). |
| Sistema | Servir imágenes optimizadas vía CDN de Cloudinary. |

## Historias de usuario

- **US-1** — Como dueño, quiero subir mi foto principal y galería de forma simple (drag&drop) y optimizada.
- **US-2** — Como sistema, quiero servir imágenes optimizadas (WebP, resize) sin procesar binarios en el servidor.

## Reglas de negocio

- **RN-1** — La subida usa **firma del servidor** + carga directa a Cloudinary (el backend no procesa binarios).
- **RN-2** — Obtener la firma **requiere autenticación** (no puede ser público).
- **RN-3** — Las imágenes se entregan **optimizadas** (resize, `q_auto`, `f_auto`/WebP).
- **RN-4** — Límite de **tamaño y tipo** de archivo (server-side, no solo `accept` en el front).
- **RN-5** — Galería **máx. 8** imágenes (cruce N-4).
- **RN-6** — Al **quitar** una imagen o **eliminar/archivar** un negocio, se elimina el asset en Cloudinary; + **limpieza periódica** de huérfanas (R2 del diseño).
- **RN-7** — Los campos `image`/`gallery` guardan **solo URLs del Cloudinary del proyecto** (validación; no URLs arbitrarias).
- **RN-8** — El **uso de Cloudinary** es visible en el monitor de cupos (cruce AD-22).

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado un usuario autenticado, cuando sube una imagen, entonces se carga directo a Cloudinary y se guarda su URL optimizada.
- **CA-2** — Dado un usuario **no autenticado**, cuando pide la firma de subida, entonces se rechaza (RN-2).
- **CA-3** — Dada una galería con 8 imágenes, cuando intento subir otra, entonces se bloquea.
- **CA-4** — Dado un archivo que excede el tamaño/tipo permitido, cuando se sube, entonces se rechaza (RN-4).
- **CA-5** — Dado que quito una imagen o se elimina un negocio, cuando ocurre, entonces el asset se elimina de Cloudinary (RN-6).
- **CA-6** — Dada una URL de imagen que no es del Cloudinary del proyecto, cuando se guarda, entonces se rechaza (RN-7).

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| Subida firmada + directa | ✅ | `/api/media/upload-signature` + upload directo; transform 800×800 q_auto f_auto. |
| RN-2 Firma autenticada | ❌ | Endpoint **público** ("temporalmente para Inscribir") (ME-1). |
| RN-4 Límite tamaño/tipo | ❌ | Solo `accept="image/*"` en el front (ME-3). |
| RN-5 Galería máx 8 | 🟡 | Validado en el front; backend no (N-4). |
| RN-6 Borrado/huérfanas | ❌ | No se borran assets al quitar/eliminar; sin limpieza (ME-2). |
| RN-7 Validar URLs | ❌ | `image`/`gallery` aceptan cualquier string (ME-4). |
| Noticias usan este uploader | ❌ | Noticias usa URL pegada (NW-17). |

## Decisiones tomadas (2026-06-20)

- **D-1** — La firma de subida **requiere autenticación** (no pública). → ME-1.
- **D-2** — Imágenes huérfanas: **borrado al quitar/eliminar + limpieza periódica** de huérfanas sin dueño. → ME-2.
- **D-3** — Validar **tamaño/tipo** (ME-3) y que las URLs sean del **Cloudinary del proyecto** (ME-4).

## Backlog derivado

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **ME-1** | Autenticar `/api/media/upload-signature` | Bajo | Hoy público → abuso de cupo; usar `get_current_user` |
| **ME-2** | Borrado de assets al quitar/eliminar + job de limpieza de huérfanas | Medio | Eliminar en Cloudinary; job periódico para huérfanas (R2) |
| **ME-3** | Validar tamaño/tipo de archivo server-side | Bajo | No solo `accept` en el front |
| **ME-4** | Validar que `image`/`gallery` sean URLs del Cloudinary del proyecto | Bajo | Evita URLs arbitrarias |
| **ME-5** | Unificar carga de imágenes de noticias con este uploader | Bajo | = NW-17 |
| **ME-6** | Exponer uso de Cloudinary en el monitor de cupos | Bajo | = AD-22 |

## Roadmap (futuro)

- **R-1 — Alt text / SEO de imágenes** (mejora indexación de imágenes).
- **R-2 — Soporte de más formatos/medios** (p. ej. video corto de producto) si el plan lo justifica.