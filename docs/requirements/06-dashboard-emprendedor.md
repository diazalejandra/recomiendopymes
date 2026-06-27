# Spec — Dashboard del Emprendedor

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-6) · Anclado al código a 2026-06-20 (rama `main`)
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
- **US-8** — Como dueño, quiero **difundir mi vitrina** (link directo, código QR, compartir a Instagram/WhatsApp) para traer mi audiencia social al catálogo _(ver DE-9)_.
- **US-9** — Como dueño, quiero **enterarme** (notificación in-app/email) de nuevas reseñas y de la aprobación/rechazo de mi negocio _(ver DE-11)_.

## Reglas de negocio

- **RN-1** — El dueño solo ve y gestiona **sus** negocios (`owner_user_id`).
- **RN-2** — El **nombre no es editable** (afecta slug SEO); la UI debe mostrarlo como **solo lectura**, no como campo editable.
- **RN-3** — Editar y cambiar estado requieren **email verificado** (= N-1).
- **RN-4** — La galería admite **máx. 8** imágenes (validado también en backend, N-4).
- **RN-5** — Transiciones del dueño: `active→inactive` (desactivar) e `inactive→pending` (solicitar reactivación).
- **RN-6** — Responder reseña requiere **email verificado** (= RV-2); una respuesta por reseña, editable.
- **RN-7** — Si el dueño cambia `business_type` a `online`, la ubicación se **degrada a comuna** (sin pin exacto) — privacidad (cruce MP-7).
- **RN-8** — El kit de difusión está disponible para negocios `active` (un negocio no publicado no debería compartirse como vitrina pública).
- **RN-9** — El dashboard prioriza **próximas acciones** (reseñas sin responder, perfil incompleto, compartir) por sobre datos pasivos, y está **optimizado para móvil**.

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

## Decisiones tomadas (2026-06-20)

- **D-1** — Nombre **solo lectura** en la edición (no-op hoy; afecta slug). → DE-1.
- **D-2** — Editar/cambiar estado y responder exigen **email verificado**. → DE-2/DE-3 (= N-1/RV-2).
- **D-3** — Botón **desactivar / solicitar reactivación** en la **tarjeta del dashboard** (con confirmación). → DE-5.
- **D-4** — Construir página **`/mi-cuenta`** (nombre/email/contraseña), que habilita Auth B-1. → DE-6.
- **D-5** — Agregar **badge de reseñas sin responder** (DE-4) y **marcar "Visitas" como aproximada** mientras `view_count` no sea confiable (DE-8).
- **D-6** — Al cambiar `business_type` a `online`, **degradar la ubicación a comuna** (cruce MP-7). → DE-7.
- **D-7** — Agregar **kit de difusión** (link + QR + compartir) y un **dashboard accionable** (próximas acciones). → DE-9/DE-10.
- **D-8** — **Notificaciones** se promueven a un **spec transversal propio** (`12-notificaciones.md`), no una línea del dashboard. → DE-11 / NT-*.
- **D-9** — **Mobile-first**: optimizar dashboard y **partir el formulario de edición** en pasos/secciones. → DE-12.
- **D-10** — **Quitar "Oferta Destacada"** (`active_offer`) del MVP hasta validar demanda (modelo + edición + catálogo). → DE-13 (cruce Negocios).

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **DE-1** | Nombre como solo lectura en la edición (con nota) | Bajo | Hoy es editable pero el backend lo ignora |
| **DE-2** | `require_verified` al editar negocio | Bajo | = N-1 (router business) |
| **DE-3** | `require_verified` al responder reseña | Bajo | = RV-2 (router review) |
| **DE-4** | Badge de reseñas sin responder en el dashboard | Bajo | Diseño 7b; contar reseñas sin `owner_response` |
| **DE-5** | Botón desactivar / solicitar reactivación en la tarjeta | Bajo | Usa `PATCH /status` con confirmación |
| **DE-6** | Página `/mi-cuenta` (nombre/email/contraseña) | Medio | Habilita Auth B-1 (email con re-verificación, password con la actual) |
| **DE-7** | Degradar ubicación a comuna al pasar a `online` | Bajo | Privacidad; cruce MP-7 |
| **DE-8** | Marcar "Visitas" como aproximada (o atenuar) | Bajo | Hasta resolver `view_count` (cruce Negocios) |
| **DE-9** | Kit de difusión: link directo + código QR + compartir a redes/WhatsApp | Medio | Solo negocios `active` (RN-8); puente social→catálogo |
| **DE-10** | Dashboard accionable: próximas acciones sugeridas | Medio | Reseñas sin responder, perfil incompleto, compartir |
| **DE-11** | Notificaciones | — | **Promovido a spec propio** `12-notificaciones.md` (NT-1..NT-6) |
| **DE-12** | Mobile-first: dashboard + edición por pasos/secciones | Medio | Audiencia mayoritariamente móvil; el form es muy largo |
| **DE-13** | **Quitar "Oferta Destacada"** (`active_offer`) del MVP | Bajo-Medio | Remover de modelo Negocios + EditBusiness + catálogo; reintroducir si se valida demanda (cruce N-13) |

## Roadmap (futuro / Fase 2)

- **R-1 — Insights reales**: visitas semana vs. anterior, términos de búsqueda que llevaron al perfil, fuentes de tráfico (más allá del contador crudo).
- **R-2 — Upsell contextual** (destacar/plan) en el dashboard (cruce monetización Fase 2).

## Notas abiertas

- **Propiedad de `/mi-cuenta`:** la gestión de cuenta es un concern de **Auth** (B-1) que se **superficie** en el dashboard; el comportamiento (cambio password/email con re-verificación) lo define el spec de Auth, la UI vive aquí.
- **Onboarding/primer uso:** el estado vacío (0 negocios) hoy es solo un link; hay espacio para un onboarding guiado de activación (a definir).
- **Editar en `pending`:** definir si el dueño puede editar y qué ve mientras el negocio espera aprobación (hoy hay botón "Previsualizar").
