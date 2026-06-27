# Spec — Reseñas

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-5) · Anclado al código a 2026-06-20 (rama `main`)
> Módulo backend: `modules/review/` · Frontend: `features/business/` (ReviewForm, ReviewItem), `features/entrepreneur/MyReviews`

## Propósito

Construir confianza mediante reseñas autenticadas: usuarios verificados califican y
comentan negocios; los dueños responden; el admin modera ocultando (sin borrar). Las
reseñas alimentan el `rating` que ordena el catálogo.

## Actores

| Actor | Capacidad |
|---|---|
| Visitante | Leer reseñas visibles. |
| Usuario verificado | Dejar una reseña en un negocio activo que no sea suyo. |
| Dueño | Responder reseñas de su negocio (una por reseña, editable). |
| Admin | Ocultar/mostrar reseñas (moderación). |

## Historias de usuario

- **US-1** — Como visitante, quiero leer las reseñas visibles de un negocio (paginadas).
- **US-2** — Como usuario verificado, quiero dejar una reseña (1–5 estrellas + comentario) en un negocio activo que no sea mío.
- **US-3** — Como dueño, quiero responder una reseña de mi negocio (una respuesta, editable).
- **US-4** — Como admin, quiero ocultar/mostrar una reseña sin borrarla (auditoría).
- **US-5** — Como sistema, quiero detectar comportamiento sospechoso y marcar al usuario para revisión del admin.
- **US-6** — Como autor, quiero editar o eliminar mi propia reseña _(decidido; ver RV-5)_.
- **US-7** — Como dueño o usuario, quiero **reportar** una reseña abusiva o falsa para que el admin la revise _(decidido; ver RV-8)_.

## Reglas de negocio

- **RN-1** — Dejar una reseña requiere **email verificado**.
- **RN-2** — Un usuario **no puede reseñar su propio negocio** (validar contra `owner_user_id`).
- **RN-3** — Un usuario solo puede dejar **una** reseña por negocio (índice único `(business_id, author_id)`).
- **RN-4** — Solo se puede reseñar negocios en estado `active`.
- **RN-5** — Las reseñas se publican **de inmediato** (sin moderación previa).
- **RN-6** — `rating` entero 1–5; `comment` 10–800 caracteres.
- **RN-7** — El dueño puede responder **una vez por reseña** (la respuesta es editable); responder requiere **email verificado**.
- **RN-8** — La respuesta del dueño se valida (1–500 caracteres).
- **RN-9** — Admin oculta/mostrar con `is_visible`; **no se borra**. El `rating`/`review_count` se recalculan sobre reseñas **visibles**.
- **RN-10** — Detección de sospechosos: si un usuario supera un umbral de reseñas en una ventana de tiempo, se marca para revisión del admin (umbral y ventana **configurables**).
- **RN-11** — Una reseña puede ser **reportada** (por el dueño del negocio o por usuarios); los reportes forman una cola de revisión para el admin.
- **RN-12** — Al publicar, el comentario pasa por un **filtro básico de contenido** (groserías / links no permitidos); lo dudoso se marca para revisión, no se publica sin control.
- **RN-13** — **Consistencia de borrado:** al eliminar la cuenta del autor, sus reseñas se **anonimizan** (se conserva el texto sin vincularlo a la persona); al **archivar** un negocio (soft-delete, N-3), sus reseñas se ocultan, no se borran.
- **RN-14** — El nombre visible del reseñador es **nombre + inicial** (minimización de datos, Ley 21.719), no el nombre completo.
- **RN-15** — La creación de reseñas tiene **rate limiting** (no solo marca: limita).
- **RN-16** — El `rating` para **ordenar el catálogo** usa un promedio **ponderado** (o exige un mínimo de reseñas), para que pocas reseñas no superen a negocios con historial sólido.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado un negocio con reseñas, cuando abro su ficha, entonces veo las reseñas **visibles** (no las ocultas), paginadas y de la más nueva a la más antigua.
- **CA-2** — Dado un usuario verificado, cuando reseña un negocio activo ajeno con datos válidos, entonces se publica al instante y el `rating` del negocio se actualiza.
- **CA-3** — Dado un usuario **sin** email verificado, cuando intenta reseñar, entonces recibe 403.
- **CA-4** — Dado el **dueño** del negocio, cuando intenta reseñar su propio negocio, entonces se rechaza (RN-2).
- **CA-5** — Dado un usuario que ya reseñó ese negocio, cuando intenta reseñar otra vez, entonces recibe 400.
- **CA-6** — Dado un negocio no `active`, cuando se intenta reseñar, entonces 404.
- **CA-7** — Dado un `rating` fuera de 1–5 o `comment` <10/>800, cuando se envía, entonces error de validación.
- **CA-8** — Dado el dueño, cuando responde una reseña de su negocio, entonces se guarda; al responder de nuevo, **reemplaza** la anterior (editable).
- **CA-9** — Dado un usuario que no es el dueño, cuando intenta responder, entonces 403.
- **CA-10** — Dada una respuesta del dueño vacía o >500, cuando se envía, entonces error de validación (RN-8).
- **CA-11** — Dado un admin, cuando oculta una reseña, entonces desaparece del perfil público y el `rating` se recalcula; al mostrarla, vuelve.
- **CA-12** — Dado un usuario que supera el umbral configurado en la ventana, cuando reseña, entonces queda marcado como sospechoso para el admin.
- **CA-13** — Dado el autor de una reseña, cuando la edita o la elimina, entonces el cambio se refleja y el `rating` del negocio se recalcula (RV-5).
- **CA-14** — Dado el dueño/usuario, cuando reporta una reseña, entonces queda en la cola de revisión del admin (RN-11).
- **CA-15** — Dado un comentario con groserías/links no permitidos, cuando se publica, entonces se bloquea o se marca para revisión (RN-12).
- **CA-16** — Dado que el autor elimina su cuenta, cuando se procesa, entonces sus reseñas quedan **anonimizadas** (sin su nombre/identidad) pero el texto persiste (RN-13).
- **CA-17** — Dado un negocio archivado, cuando se consulta, entonces sus reseñas no aparecen pero no se borran (RN-13).
- **CA-18** — Dada una reseña, cuando se muestra públicamente, entonces el autor aparece como **nombre + inicial** (RN-14).
- **CA-19** — Dado un negocio con 1 reseña 5★ y otro con muchas y buen promedio, cuando se ordena el catálogo, entonces el de historial sólido no queda por debajo solo por el rating crudo (RN-16).

## Roadmap (futuro / Fase 2)

- **R-1 — Notificación al dueño** de nueva reseña (badge en dashboard / email).
- **R-2 — Detección de sospechosos avanzada**: "mismo rating en negocios distintos" + `flagged` por reseña (no solo por usuario), con ventana configurable.
- **R-3 — Votos de utilidad** ("¿te sirvió esta reseña?").
- **R-4 — Detección de *review bombing* por negocio** (spike de reseñas/ratings bajos en un negocio), complementaria a la detección por usuario.

## Limitaciones conocidas

- **L-1 — Sin prueba de compra (C).** El email verificado no garantiza que el reseñador haya sido cliente. Es la limitación estructural de cualquier sistema de reseñas sin transacciones. Se mitiga con: una reseña por negocio (RN-3), detección de sospechosos (RN-10), reporte (RN-11), filtro de contenido (RN-12) y rate limit (RN-15) — pero no se elimina. Reevaluar si aparece abuso real.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Leer reseñas | ✅ | `GET /api/businesses/{id}/reviews`, solo visibles, orden desc, paginado (≤50). |
| US-2 Crear reseña | 🟡 | `POST …/reviews` con `require_verified` ✅, negocio activo ✅, una por negocio ✅; **falta bloquear auto-reseña** (RV-1). |
| US-3 Responder | 🟡 | `POST /api/reviews/{id}/response`; **sin `require_verified`** (RV-2) y **sin validar texto** (RV-3). |
| US-4 Moderación admin | ✅ | `toggle_visibility` (vía panel admin); recalcula rating. |
| US-5 Sospechosos | 🟡 | Implementado, pero difiere del diseño (RV-4). |
| RN-1 Verificación reseñar | ✅ | `require_verified` en el router. |
| RN-2 No auto-reseña | ❌ | No se valida `owner_user_id` (RV-1). |
| RN-3 Una por negocio | ✅ | Check + índice único. |
| RN-6 Validación rating/comment | ✅ | `ReviewCreate` (1–5, 10–800). |
| RN-7 Responder editable | 🟡 | Editable ✅; falta verificación (RV-2). |
| RN-8 Validar respuesta | ❌ | `OwnerResponseRequest.text` sin min/max (RV-3). |
| RN-9 Moderación + recálculo | ✅ | Sobre reseñas visibles. |
| RN-10 Sospechosos configurable | 🟡 | Umbral configurable (`config.review_rate_limit`); **ventana hardcodeada** 24h (RV-4). |

## Decisiones tomadas (2026-06-20)

- **D-1** — **Bloquear auto-reseña**: el dueño no puede reseñar su propio negocio (must-fix). → RV-1.
- **D-2** — **Responder requiere email verificado** (alinea con D-2 de Auth). → RV-2.
- **D-3** — **Validar** la respuesta del dueño (1–500). → RV-3.
- **D-4** — Antispam: se mantiene el **conteo simple** pero con **ventana configurable** (como el umbral); la lógica fina (mismo rating en negocios distintos + `flagged` por reseña) queda en roadmap R-2. → RV-4.
- **D-5** — El usuario puede **editar y eliminar** su propia reseña (recalcula rating; apoya derecho de supresión ARCO). → RV-5.
- **D-6** — Consistencia de borrado: anonimizar reseñas al borrar cuenta + ocultar al archivar negocio. → RN-13, RV-7.
- **D-7** — Agregar **reporte de reseñas** + **filtro básico de contenido**. → RN-11/RN-12, RV-8/RV-9.
- **D-8** — Orden del catálogo con **rating ponderado** (no crudo). → RN-16, RV-10 (afecta orden de Negocios).
- **D-9** — **Privacidad**: nombre visible = nombre + inicial; **rate limit** al crear reseña. → RN-14/RN-15, RV-11/RV-12.

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **RV-1** | Bloquear auto-reseña (validar `owner_user_id`) | Bajo | Must-fix; el dueño no puede reseñarse |
| **RV-2** | `require_verified` en responder reseña | Bajo | = Auth B-2 / Negocios N-1 |
| **RV-3** | Validar texto de respuesta del dueño (1–500) | Bajo | `OwnerResponseRequest` sin min/max hoy |
| **RV-4** | Ventana de detección configurable | Bajo | El umbral ya lo es; falta la ventana |
| **RV-5** | Editar y eliminar reseña propia (endpoints + recalc rating + UI) | Medio | Usa `ReviewUpdate`; borrar recalcula rating |
| **RV-6** | Capturar `DuplicateKeyError` en crear reseña | Bajo | Evita 500 en carrera (índice único) |
| **RV-7** | Anonimizar reseñas al borrar cuenta + ocultar al archivar negocio | Medio | Consistencia con Auth B-7 y Negocios N-3 (RN-13) |
| **RV-8** | Flujo de reportar reseña → cola de revisión admin | Medio | Para dueño y usuarios (RN-11) |
| **RV-9** | Filtro básico de contenido al publicar (groserías/links) | Medio | Bloquear o marcar (RN-12) |
| **RV-10** | Rating ponderado/bayesiano (o mínimo de reseñas) para el orden | Medio | Afecta el orden del catálogo (Negocios RN-10) |
| **RV-11** | Nombre visible = nombre + inicial | Bajo | Minimización de datos (RN-14) |
| **RV-12** | Rate limit al crear reseña | Bajo | slowapi (RN-15) |
