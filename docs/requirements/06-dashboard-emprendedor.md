# Spec — Dashboard del Emprendedor

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
> Frontend: `features/entrepreneur/` (Dashboard, EditBusiness, MyReviews), `features/business/CloudinaryUpload`

## Propósito

Espacio privado (`/mi-negocio`) donde el dueño gestiona sus emprendimientos: ve estado y
métricas, edita la ficha, administra imágenes, responde reseñas y controla la
visibilidad (activar/desactivar). También debería gestionar su cuenta.

## Actores

| Actor | Capacidad |
|---|---|
| Dueño | Gestiona **sus** emprendimientos y su cuenta. |

## Historias de usuario

- **US-1** — Como dueño, quiero ver la lista de mis emprendimientos con su estado y métricas.
- **US-2** — Como dueño, quiero inscribir un nuevo emprendimiento.
- **US-3** — Como dueño, quiero editar mi ficha (info, entrega, ubicación, redes, oferta, imágenes), **excepto el nombre**.
- **US-4** — Como dueño, quiero gestionar imágenes (principal + galería, máx. 8).
- **US-5** — Como dueño, quiero ver y responder las reseñas de mi negocio.
- **US-6** — Como dueño, quiero **desactivar** mi negocio o **solicitar su reactivación**.
- **US-7** — Como dueño, quiero gestionar mi **cuenta** (nombre, email, contraseña).

## Reglas de negocio

- **RN-1** — El dueño solo ve y gestiona **sus** negocios (`owner_user_id`).
- **RN-2** — El **nombre no es editable** (afecta slug SEO); la UI debe mostrarlo como **solo lectura**, no como campo editable.
- **RN-3** — Editar y cambiar estado requieren **email verificado** (= N-1).
- **RN-4** — La galería admite **máx. 8** imágenes (validado también en backend, N-4).
- **RN-5** — Transiciones del dueño: `active→inactive` (desactivar) e `inactive→pending` (solicitar reactivación).
- **RN-6** — Responder reseña requiere **email verificado** (= RV-2); una respuesta por reseña, editable.
- **RN-7** — Si el dueño cambia `business_type` a `online`, la ubicación se **degrada a comuna** (sin pin exacto) — privacidad (cruce MP-7).

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el dashboard, cuando lo abro, entonces veo solo mis negocios con badge de estado y métricas (visitas, rating, reseñas).
- **CA-2** — Dado que edito mi negocio, cuando guardo, entonces se actualizan los cambios; el **nombre no** se puede modificar (campo de solo lectura).
- **CA-3** — Dado un usuario sin email verificado, cuando intenta editar o responder, entonces se bloquea (RN-3/RN-6).
- **CA-4** — Dado mi negocio activo, cuando pulso "Desactivar", entonces pasa a `inactive` y desaparece del catálogo.
- **CA-5** — Dado mi negocio inactivo, cuando pulso "Solicitar reactivación", entonces pasa a `pending`.
- **CA-6** — Dada la galería, cuando intento subir más de 8, entonces se limita a 8.
- **CA-7** — Dada una reseña de mi negocio, cuando respondo, entonces se publica y queda editable.
- **CA-8** — Dado que cambio mi tipo a `online`, cuando guardo, entonces mi ubicación pasa a comuna (sin dirección exacta) (RN-7).
- **CA-9** — Dado el dashboard, cuando hay reseñas sin responder, entonces veo un indicador (badge) — ver DE-4.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Lista + métricas | ✅ | `getMine`; badge de estado; visitas/rating/reseñas; barra de completitud. |
| US-2 Inscribir | ✅ | Link a `/inscribir`. |
| US-3 Editar | 🟡 | Funciona, pero **muestra el nombre como editable** (no-op en backend) (DE-1); sin verificación (DE-2 = N-1). |
| US-4 Imágenes | ✅ | `CloudinaryUpload` (principal + galería máx 8 en front). |
| US-5 Ver/responder reseñas | 🟡 | `MyReviews` + respuesta; responder **sin verificación** (DE-3 = RV-2). |
| US-6 Desactivar/reactivar | ❌ | **Sin UI**; el backend soporta `PATCH /status` (DE-5). |
| US-7 Gestión de cuenta | ❌ | **No existe** sección de cuenta (nombre/email/contraseña) (DE-6 = Auth B-1). |
| RN-7 Degradar ubicación al pasar a online | ❌ | El cambio de tipo no ajusta la ubicación (DE-7, cruce MP-7). |
| Badge "sin responder" | ❌ | El diseño (7b) lo pedía (DE-4). |
| Métrica "Visitas" | 🟡 | Usa `view_count` inflado (cruce Negocios H-5/R-6). |

## Hallazgos / decisiones pendientes

- **DE-1 (gap UX, must-fix)** — El nombre se muestra editable pero el backend lo ignora. Hacerlo **solo lectura** con nota ("el nombre no se puede cambiar"). *(fix)*
- **DE-2 / DE-3 (gap)** — Editar y responder no exigen verificación (= N-1 / RV-2). *(backlog)*
- **DE-4 (mejora)** — Badge de **reseñas sin responder** en el dashboard (diseño 7b). *(decisión)*
- **DE-5 (gap)** — Falta UI para **desactivar / solicitar reactivación** (el backend ya lo soporta). *(decisión: dónde — tarjeta del dashboard o edición)*
- **DE-6 (gap)** — Falta **gestión de cuenta** (nombre/email/contraseña), que además habilita Auth B-1. *(decisión: construir página `/mi-cuenta`)*
- **DE-7 (cruce)** — Al cambiar a `online`, degradar la ubicación a comuna (privacidad, MP-7). *(fix)*
- **DE-8 (menor)** — La métrica "Visitas" es poco confiable hasta resolver el `view_count` (cruce Negocios). Considerar ocultarla o marcarla como aproximada mientras tanto.
