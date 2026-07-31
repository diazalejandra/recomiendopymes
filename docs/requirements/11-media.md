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
| RN-2 Firma autenticada | ✅ | `get_current_user` en `/api/media/upload-signature` (sprint P0, ME-1). |
| RN-4 Límite tamaño/tipo | ❌ | Solo `accept="image/*"` en el front (ME-3, diferido — ver Backlog). |
| RN-5 Galería máx 8 | 🟡 | Validado en el front; backend no (N-4). |
| RN-6 Borrado/huérfanas | ❌ | No se borran assets al quitar/eliminar; sin limpieza (ME-2). |
| RN-7 Validar URLs | ✅ | `image`/`gallery` validan host `res.cloudinary.com` + cloud del proyecto (2026-07-02, ME-4). |
| Noticias usan este uploader | ❌ | Noticias usa URL pegada (NW-17). |

## Decisiones tomadas (2026-06-20)

- **D-1** — La firma de subida **requiere autenticación** (no pública). → ME-1.
- **D-2** — Imágenes huérfanas: **borrado al quitar/eliminar + limpieza periódica** de huérfanas sin dueño. → ME-2.
- **D-3** — Validar **tamaño/tipo** (ME-3) y que las URLs sean del **Cloudinary del proyecto** (ME-4).

## Backlog derivado

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| ~~**ME-1**~~ | ✅ Autenticar `/api/media/upload-signature` | Bajo | Hecho (sprint P0): `get_current_user` |
| **ME-2** | Borrado de assets al quitar/eliminar + job de limpieza de huérfanas | Medio | Eliminar en Cloudinary; job periódico para huérfanas (R2) |
| **ME-3** | Validar tamaño/tipo de archivo server-side | Bajo | **Diferido a la migración Next.js.** Con subida firmada directa, forzar tipo/tamaño exige incluir `allowed_formats`/límites **en los params firmados**, lo que obliga a que el cliente los envíe (si no, la firma no valida y la subida se rompe). Es un cambio de contrato front+back; hacerlo junto con el rework del uploader. Mientras tanto, ME-4 acota el riesgo (solo URLs de nuestro Cloudinary). |
| **ME-4** | ✅ Validar que `image`/`gallery` sean URLs del Cloudinary del proyecto | Bajo | **Hecho (2026-07-02).** `field_validator` en `BusinessCreate`/`BusinessUpdate`; rechaza host ajeno y `javascript:` |
| **ME-5** | Unificar carga de imágenes de noticias con este uploader | Bajo | = NW-17 |
| **ME-6** | Exponer uso de Cloudinary en el monitor de cupos | Bajo | = AD-22 |
| **ME-7** | Reordenar el wizard de `/inscribir`: autenticar **antes** del paso de imágenes | Bajo | Hoy el paso de imágenes (3) va antes del registro/login (4), pero la firma de subida requiere sesión (ME-1) → un invitado que suba imágenes recibe error. Logueado funciona. Mover el paso de auth antes de imágenes (o exigir sesión al entrar al wizard). _(detectado 2026-07-12 en la migración, hito C)_ |

## Roadmap (futuro)

- **R-1 — Alt text / SEO de imágenes** (mejora indexación de imágenes).
- **R-2 — Soporte de más formatos/medios** (p. ej. video corto de producto) si el plan lo justifica.