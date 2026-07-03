# Spec — Catálogo y Emprendimientos

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-6) · Anclado al código a 2026-06-20 (rama `main`)
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
- **RN-4** — Solo los negocios `active` aparecen en el catálogo/listado público (se **excluyen** `pending`, `inactive`, `rejected` y `archived`) y solo `active` suma `view_count`.
- **RN-5** — Negocios `pending`/`inactive` solo son visibles por su dueño o admin (404 al resto). _(implementado en 1.1.0)_
- **RN-6** — `activated_at` se fija en la **primera** activación; alimenta el badge "🆕 Nuevo" por 30 días.
- **RN-7** — Transiciones de estado: el **dueño** puede `active→inactive` e `inactive→pending`; el **admin**, cualquiera.
- **RN-8** — **Inscribir y editar** un negocio requieren **email verificado** _(decisión D-2 del módulo Auth; ver B-2)_.
- **RN-9** — Editar un negocio: lo puede hacer el **dueño** y el **admin** (matriz de permisos del diseño).
- **RN-10** — **El orden del catálogo lo define este módulo (fuente única).** Composición:
  1. *(si el usuario eligió ubicación)* **nivel de cercanía** — tu comuna → tu región → envío nacional → resto (Mapa RN-10/RN-12);
  2. dentro de cada nivel: `featured` **vigente** (`featured_until > now`) → nuevos (≤ boost días) → **rating ponderado** (Reseñas RV-10) → antigüedad → `_id` (tiebreaker estable, N-6).
  Sin ubicación elegida, se omite el paso 1. _(Reconciliación C1: Mapa y Reseñas aportan insumos; el orden final vive aquí.)_
- **RN-11** — Filtro "envíos nacionales": junto a una ciudad, incluye los negocios de esa ciudad **y** los de `delivery_scope: nationwide`.
- **RN-12** — La galería admite **máximo 8 imágenes**.
- **RN-13** — Eliminar un negocio es exclusivo de **admin** y elimina también sus reseñas.
- **RN-14** — El `rating` y `review_count` se recalculan desde las reseñas **visibles**.
- **RN-15 — Máquina de estados (fuente única, reconciliación C3):**
  `pending` (nuevo, espera aprobación) → `active` ⇄ `inactive` (desactivado por dueño/admin);
  `rejected` (admin rechaza, con motivo — AD-1); `archived` (soft-delete — N-3).
  **Solo `active` es público**; `rejected`/`archived` no vuelven al catálogo. Transiciones del
  dueño: `active→inactive`, `inactive→pending`; el admin puede todas.
- **RN-16 — Borrado de cuenta (reconciliación C6):** al borrar la cuenta del dueño (Auth B-7),
  sus negocios se **archivan/anonimizan** (no quedan públicos ni huérfanos).
- **RN-17 — `tags` (reconciliación C7):** el negocio tiene `tags` libres (de Categorías C-2),
  lista normalizada, máx. 8; complementan la categoría canónica para descubrimiento.

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
- **R-5 — Paginación por keyset/cursor** (P-3): a escala, el sort con `is_new_boost` computado obliga a ordenar en memoria; el cursor evita el costo del `$skip` profundo.
- **R-6 — `view_count` fuera del read-path / deduplicado** (P-9): hoy se escribe en cada lectura de ficha.
- **R-7 — Caché del catálogo (CDN/ISR)** (P-10): es público y casi estático.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1/US-2 Catálogo + filtros | ✅ | `GET /api/businesses` con filtros, búsqueda y orden. |
| US-3 Inscribir | ✅ | `POST /api/businesses` (status `pending`). |
| US-5 Ver mis negocios | ✅ | `GET /api/businesses/mine`. |
| US-6 Editar | 🟡 | `PUT` solo dueño; admin editará ajeno tras N-2. Nombre no editable ✅. |
| US-7 Estados dueño | ✅ | `PATCH /{id}/status` con transiciones válidas. |
| US-8 Admin estado/eliminar | 🟡 | Cambia estado y elimina; editar ajeno → N-2; borrado pasará a soft (N-3). |
| RN-1 Nombre no editable | ✅ | `BusinessUpdate` no incluye `name`. |
| RN-2 Slug único | ✅ | `_generate_unique_slug`. |
| RN-5 Acceso no-active | ✅ | Implementado en 1.1.0 (ver `01-auth.md`). |
| RN-8 Verificación inscribir/editar | ❌ | Usan `get_current_user`, no `require_verified` → N-1. |
| RN-9 Admin edita cualquiera | ❌ | `PUT` bloquea no-dueños; decidido habilitar → N-2. |
| RN-10 Orden catálogo | 🟡 | Implementado, pero ignora `featured_until` (R-1) y `boost` hardcodeado (R-2). |
| RN-11 Envíos nacionales | ✅ | `$or` ciudad / `nationwide`. |
| RN-12 Galería máx 8 | ❌ | No validado; decidido validar → N-4. |
| RN-13 Eliminar (admin) | 🟡 | Hoy borrado **duro**; pasará a soft-delete → N-3. |
| RN-14 Recalcular rating | ✅ | Sobre reseñas visibles. |

## Decisiones tomadas (2026-06-20)

- **D-1** — **`owner` se mantiene** como nombre de contacto/fantasía del negocio, distinto del nombre de la cuenta (`owner_user_id`). Se documenta como tal; no se elimina.
- **D-2** — Se **habilita la edición de admin** sobre cualquier negocio (alinea con la matriz de permisos). → RN-9, N-2.
- **D-3** — Eliminar negocio pasa a **soft-delete** (sin borrar de la BD; reseñas se ocultan, no se borran). → RN-13, N-3.
- **D-4** — Se aplica `require_verified` a inscribir/editar/cambiar-estado (decisión D-2 de Auth). → RN-8, N-1.
- **D-5** — Se valida la galería a **máx. 8** imágenes. → RN-12, N-4.
- **D-6** — `view_count` sin deduplicar se **acepta por ahora** (H-5); se revisará si las métricas se vuelven relevantes.
- **D-7** — Mejoras de lógica al backlog (paginación, búsqueda, robustez) → N-6..N-12; las de escala a roadmap → R-5..R-7.

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **N-1** | `require_verified` en inscribir/editar/cambiar-estado | Bajo | = Auth B-2; la dependencia ya existe |
| **N-2** | Permitir que el admin edite cualquier negocio (`PUT`) | Bajo | Permitir si es dueño **o** admin |
| **N-3** | Soft-delete de negocios (status archivado + ocultar reseñas) en vez de borrado duro | Medio | Conserva auditoría; ajustar catálogo para excluir archivados |
| **N-4** | Validar galería a máx. 8 imágenes en el modelo | Bajo | `max_length=8` en `gallery` |
| **N-5** | ✅ Eliminar código muerto `_is_new_boost()` | Bajo | **Hecho (2026-07-02).** El boost se calcula en el pipeline |
| **N-6** | Orden estable: `_id` como último criterio de sort (P-1) | Bajo | Evita repetir/saltar ítems entre páginas |
| **N-7** | Capar `limit` público (~60–100); mapa con límite propio (P-2) | Bajo | Hoy permite 500 en ruta pública |
| **N-8** | Búsqueda con índice de texto + colación sin acentos (P-4) | Medio | Hoy `$regex` hace scan y distingue acentos |
| **N-9** | Validar `category` contra la colección de categorías (P-8) | Bajo-Medio | Evita categorías que el filtro nunca muestra |
| **N-10** | ✅ Reintentar slug ante `DuplicateKeyError` (P-5) | Bajo | **Hecho (2026-07-02).** `create()` reintenta 5 veces con slug fresco; si no, 409 |
| **N-11** | ✅ ID inválido → 404 en `get`/`update`/`status`/`delete` (P-6) | Bajo | **Hecho (2026-07-02).** Helper `to_object_id()` compartido (negocios + reseñas) |
| **N-12** | Validar rango de `coordinates` y exigir coords en physical/both (P-7) | Bajo | Un físico sin coords no aparece en el mapa |
| **N-13** | **Quitar `active_offer`** ("Oferta Destacada") del MVP | Bajo-Medio | Decisión del Dashboard (DE-13); remover de modelo + edición + catálogo hasta validar demanda |
| **N-14** | Agregar estado `rejected` al ciclo de vida (distinto de `inactive`) | Bajo | Decisión del Admin (AD-1); excluir `rejected` del catálogo como ya se excluye no-active |
| **N-15** | Medir **leads/conversión**: clics a WhatsApp/Instagram/web/mapa desde la ficha | Medio | El valor real para el emprendedor; hoy solo `view_count` (G2) |
| **N-16** | **Horarios** de atención + `LocalBusiness` rico (openingHours, priceRange) | Medio | Negocio (físicos) + rich results SEO (G4) |
| **N-17** | Soportar `archived` (soft-delete) y `rejected` en el modelo y filtros | Bajo | Implementa la máquina de estados RN-15 |
| **N-18** | Buscador de ciudad: mostrar solo comunas **con negocios activos**, no todas las de Chile | Bajo-Medio | Hoy `/api/cities` devuelve todas las comunas de `REGIONS_DATA` → lista larguísima con ciudades sin catálogo. Derivar de `distinct(city)` sobre negocios `active` (o marcar/ordenar las que tienen resultados). Afecta el buscador del home y filtros. Está también en el SPA estable. _(detectado 2026-07-02 en QA de la migración)_ |

## Notas abiertas

- `owner` documentado como **nombre de contacto** (D-1); considerar prellenarlo con el nombre del usuario al inscribir, editable.
