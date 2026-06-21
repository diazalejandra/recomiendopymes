# Spec — Catálogo y Emprendimientos

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
> Módulo backend: `modules/business/` · Frontend: `features/catalog/`, `features/business/`, `features/entrepreneur/`

## Propósito

Dar visibilidad pública a los emprendimientos: un catálogo navegable con filtros y
búsqueda, y una ficha por negocio (con SEO) que centraliza contacto, redes y reseñas.
Es el núcleo de valor del producto.

## Actores

| Actor | Capacidad |
|---|---|
| Visitante | Ver catálogo, filtrar/buscar, ver fichas activas. |
| Usuario | Además, inscribir un emprendimiento. |
| Dueño | Editar, desactivar/reactivar y ver sus emprendimientos (todos los estados). |
| Admin | Aprobar/cambiar estado de cualquiera, editar y eliminar. |

## Historias de usuario

- **US-1** — Como visitante, quiero ver el catálogo de negocios activos con paginación.
- **US-2** — Como visitante, quiero filtrar por categoría y ciudad, activar "envíos nacionales" y buscar por texto.
- **US-3** — Como visitante, quiero abrir la ficha pública de un negocio con su info, redes y reseñas.
- **US-4** — Como usuario, quiero inscribir un emprendimiento (queda pendiente de aprobación).
- **US-5** — Como dueño, quiero ver todos mis emprendimientos con su estado.
- **US-6** — Como dueño, quiero editar mi emprendimiento (excepto el nombre).
- **US-7** — Como dueño, quiero desactivar mi negocio o solicitar su reactivación.
- **US-8** — Como admin, quiero aprobar, cambiar el estado, editar o eliminar cualquier negocio.

## Reglas de negocio

- **RN-1** — El **nombre no es editable** tras crear (afecta el slug SEO). El modelo de update no lo incluye.
- **RN-2** — El **slug** es único, generado del nombre al crear; ante colisión agrega sufijo numérico (`-2`, `-3`); no se regenera.
- **RN-3** — Un negocio nace en `pending`; solo un admin lo pasa a `active`.
- **RN-4** — Solo los negocios `active` aparecen en el catálogo/listado público y suman `view_count`.
- **RN-5** — Negocios `pending`/`inactive` solo son visibles por su dueño o admin (404 al resto). _(implementado en 1.1.0)_
- **RN-6** — `activated_at` se fija en la **primera** activación; alimenta el badge "🆕 Nuevo" por 30 días.
- **RN-7** — Transiciones de estado: el **dueño** puede `active→inactive` e `inactive→pending`; el **admin**, cualquiera.
- **RN-8** — **Inscribir y editar** un negocio requieren **email verificado** _(decisión D-2 del módulo Auth; ver B-2)_.
- **RN-9** — Editar un negocio: lo puede hacer el **dueño** y el **admin** (matriz de permisos del diseño).
- **RN-10** — Orden del catálogo: `featured` desc → nuevos (≤30 días) desc → `rating` desc → antigüedad.
- **RN-11** — Filtro "envíos nacionales": junto a una ciudad, incluye los negocios de esa ciudad **y** los de `delivery_scope: nationwide`.
- **RN-12** — La galería admite **máximo 8 imágenes**.
- **RN-13** — Eliminar un negocio es exclusivo de **admin** y elimina también sus reseñas.
- **RN-14** — El `rating` y `review_count` se recalculan desde las reseñas **visibles**.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el catálogo, cuando lo abro sin sesión, entonces veo solo negocios `active`, paginados, ordenados por RN-10.
- **CA-2** — Dado un filtro de categoría/ciudad, cuando lo aplico, entonces el listado se filtra; al limpiarlo, vuelve completo.
- **CA-3** — Dado el toggle "envíos nacionales" con una ciudad, cuando lo activo, entonces aparecen también negocios `nationwide` de otras ciudades.
- **CA-4** — Dada una búsqueda por texto, cuando busco, entonces coincide por nombre/descripción/categoría (sin distinguir mayúsculas); sin resultados muestra vacío, no error.
- **CA-5** — Dado un negocio `active`, cuando abro su ficha, entonces veo sus datos + reseñas y se incrementa `view_count`.
- **CA-6** — Dado un negocio `pending`/`inactive`, cuando lo abre alguien que no es dueño/admin, entonces recibe 404.
- **CA-7** — Dado un usuario con email verificado, cuando inscribe un negocio con datos válidos, entonces se crea en `pending` con slug único.
- **CA-8** — Dado un usuario **sin** email verificado, cuando intenta inscribir, entonces recibe 403 (RN-8).
- **CA-9** — Dado un nombre duplicado, cuando inscribo, entonces el slug recibe sufijo numérico y no colisiona.
- **CA-10** — Dado que soy el dueño, cuando edito mi negocio, entonces se guardan los cambios; el **nombre no** se puede cambiar.
- **CA-11** — Dado que no soy el dueño ni admin, cuando intento editar, entonces recibo 403.
- **CA-12** — Dado un admin, cuando edita un negocio ajeno, entonces puede guardar cambios (RN-9).
- **CA-13** — Dado que soy dueño, cuando desactivo (`active→inactive`) o solicito reactivación (`inactive→pending`), entonces el estado cambia; otras transiciones me dan 400.
- **CA-14** — Dado un admin, cuando aprueba un negocio `pending`, entonces pasa a `active` y se fija `activated_at` la primera vez.
- **CA-15** — Dado un admin, cuando elimina un negocio, entonces se borra junto con sus reseñas.
- **CA-16** — Dado un negocio recién aprobado (≤30 días), cuando aparece en el catálogo, entonces lleva el badge "Nuevo" y prioridad de orden.
- **CA-17** — Dada una galería de más de 8 imágenes, cuando inscribo/edito, entonces se rechaza o se limita a 8 (RN-12).

## Roadmap (futuro / Fase 2)

- **R-1 — Destacados (`featured`)**: el orden debe respetar `featured_until > now` (un destacado expirado vuelve al orden normal). Hoy el sort solo mira `featured`.
- **R-2 — `new_business_boost_days` configurable** desde el panel admin (hoy hardcodeado a 30).
- **R-3 — Verificación de identidad (`is_verified`)** como badge de confianza.
- **R-4 — Límite de negocios pendientes por usuario** (anti-spam, R7 del diseño).

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1/US-2 Catálogo + filtros | ✅ | `GET /api/businesses` con filtros, búsqueda y orden. |
| US-3 Inscribir | ✅ | `POST /api/businesses` (status `pending`). |
| US-5 Ver mis negocios | ✅ | `GET /api/businesses/mine`. |
| US-6 Editar | 🟡 | `PUT` solo dueño; **admin no puede editar** ajeno (ver H-2). Nombre no editable ✅. |
| US-7 Estados dueño | ✅ | `PATCH /{id}/status` con transiciones válidas. |
| US-8 Admin estado/eliminar | 🟡 | Cambia estado y elimina; **editar ajeno no** (H-2). |
| RN-1 Nombre no editable | ✅ | `BusinessUpdate` no incluye `name`. |
| RN-2 Slug único | ✅ | `_generate_unique_slug`. |
| RN-5 Acceso no-active | ✅ | Implementado en 1.1.0 (ver `01-auth.md`). |
| RN-8 Verificación inscribir/editar | ❌ | Usan `get_current_user`, no `require_verified` (B-2). |
| RN-9 Admin edita cualquiera | ❌ | `PUT` bloquea no-dueños (H-2). |
| RN-10 Orden catálogo | 🟡 | Implementado, pero ignora `featured_until` (R-1) y `boost` hardcodeado (R-2). |
| RN-11 Envíos nacionales | ✅ | `$or` ciudad / `nationwide`. |
| RN-12 Galería máx 8 | ❌ | No validado en el modelo (H-3). |
| RN-13 Eliminar (admin) | 🟡 | Borrado **duro** de negocio + reseñas (H-4). |
| RN-14 Recalcular rating | ✅ | Sobre reseñas visibles. |

## Hallazgos / decisiones pendientes

- **H-1 (decisión)** — `owner` es texto libre **además** de `owner_user_id`. ¿Se mantiene (nombre de fantasía del dueño/contacto) o se deriva del usuario y se elimina del input? *(decisión)*
- **H-2 (gap vs diseño)** — El admin **no puede editar** negocios ajenos (`PUT` es solo-dueño). El diseño dice que el admin edita cualquiera. ¿Se habilita edición admin? *(decisión + B)*
- **H-3 (gap)** — La galería no valida el **máx. 8** (RN-12). Recomendado validar en el modelo.
- **H-4 (decisión)** — Eliminar negocio hace **borrado duro** y elimina sus reseñas, a diferencia del soft-delete del resto del sistema. ¿Se mantiene el hard-delete o se pasa a soft (status `deleted`/auditoría)? *(decisión)*
- **H-5 (menor)** — `view_count` se incrementa en cada visita sin deduplicar (infla métricas). ¿Se deja así por ahora?
- **H-6 (limpieza)** — `_is_new_boost()` es código muerto (el boost se calcula en el pipeline). Se puede eliminar.
