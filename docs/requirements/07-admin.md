# Spec — Panel de Administración

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-6) · Anclado al código a 2026-06-20 (rama `main`)
> Backend: `modules/admin/` (+ moderación de reseñas en `review`, CRUD categorías en `meta`)
> Frontend: `features/admin/` (AdminLayout, DashboardPage, BusinessesTable, ReviewsTable, UsersTable, CategoriesManager, ConfigPanel, LegalEditor, NewsPage)

## Propósito

Dar al admin el control de la plataforma: moderar negocios y reseñas, gestionar usuarios,
editar páginas legales, configurar parámetros y ver métricas. Es la herramienta de
gobernanza y confianza del sitio.

## Actores

| Actor | Capacidad |
|---|---|
| Admin | Acceso total al panel (`role: admin`). Creado por seed o promovido por otro admin. |

## Historias de usuario

- **US-1** — Como admin, quiero ver un dashboard con métricas clave.
- **US-2** — Como admin, quiero listar/filtrar negocios por estado y **aprobar/rechazar** (con motivo).
- **US-3** — Como admin, quiero **editar** cualquier negocio.
- **US-4** — Como admin, quiero **moderar reseñas** (ocultar/mostrar) y revisar las **reportadas/sospechosas**.
- **US-5** — Como admin, quiero gestionar usuarios: activar/desactivar (cascada), promover/degradar admin, limpiar flag de sospechoso.
- **US-6** — Como admin, quiero editar las **páginas legales** (T&C, privacidad).
- **US-7** — Como admin, quiero **configurar parámetros** (umbral/ventana antispam, días de boost de nuevos…).
- **US-8** — Como admin, quiero gestionar **categorías** (CRUD).
- **US-9** — Como **fundadora**, quiero un panel con **salud del producto** (activación, retención, categorías/ciudades, conversión), no solo conteos.
- **US-10** — Como admin, quiero responder una inscripción con **"necesita cambios"** y una nota al dueño, además de aprobar/rechazar.
- **US-11** — Como fundadora, quiero **delegar moderación** con un rol acotado (**moderador**) sin ceder control total.
- **US-12** — Como admin, quiero recibir y gestionar los **mensajes de contacto** del sitio.
- **US-13** — Como fundadora, quiero **difundir anuncios** a emprendedores/usuarios.
- **US-14** — Como fundadora, quiero ver el **uso vs. límites** de mi infraestructura free-tier.

## Reglas de negocio

- **RN-1** — Todo el panel requiere `role: admin` (`require_admin`).
- **RN-2** — **Aprobar**: `pending → active`; fija `activated_at` la primera vez.
- **RN-3** — **Rechazar**: requiere **motivo**; usa un estado **dedicado `rejected`** (no se confunde con `inactive`); dispara notificación al dueño con el motivo (NT-2).
- **RN-4** — **Inactivar usuario** cascadea (oculta reseñas, negocios `active→inactive`); **reactivar revierte** la cascada (ver `01-auth` / decisión R8).
- **RN-5** — **No dejar el sistema sin admin**: bloquear desactivar/degradar al **último admin** y la **auto-desactivación**.
- **RN-6** — Toda acción de moderación/gestión queda en un **log de auditoría** (quién, qué, cuándo).
- **RN-7** — `config` y `legal` solo admin; `config` se valida contra **claves conocidas** (no aceptar cualquier clave).
- **RN-8** — Las reseñas **reportadas/sospechosas** se destacan en una cola para revisión.
- **RN-9** — Los pendientes muestran su **antigüedad**; los de **bajo riesgo** (email verificado + perfil completo + sin flags) pueden **auto-aprobarse** con post-moderación.
- **RN-10** — El panel permite ver inscripciones/reseñas **agrupadas por dueño** y su **velocidad** de creación (anti-spam, R7 del diseño).
- **RN-11** — Existe el estado **"necesita cambios"**: el negocio vuelve al dueño con una **nota** del admin (no es rechazo).
- **RN-12** — Rol **moderador**: modera negocios/reseñas pero **no** gestiona admins, config ni legales.
- **RN-13** — Las cuentas con rol admin/moderador pueden requerir **2FA**.
- **RN-14** — La configuración se expone como **controles específicos** (umbral/ventana antispam, días de boost…), no como editor genérico clave/valor.
- **RN-15** — El **contacto** se envía desde un formulario **público** (footer) y los mensajes llegan al **panel admin** (bandeja); no vive en el panel del emprendedor.
- **RN-16** — La **difusión** del admin llega al **centro de notificaciones in-app**; el email se usa solo para anuncios importantes (cruce Notificaciones).
- **RN-17** — El **monitor de cupos** muestra el uso de Mongo (cálculo barato vía `db.stats()`) + una **tarjeta de límites** con enlaces a cada proveedor; **sin integraciones pesadas** a sus APIs.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el panel, cuando entra un no-admin, entonces recibe 403.
- **CA-2** — Dado el dashboard, cuando lo abro, entonces veo conteos de usuarios, negocios por estado y reseñas (y, objetivo, reseñas del mes / nuevos usuarios / top categorías).
- **CA-3** — Dado un negocio `pending`, cuando lo apruebo, entonces pasa a `active` y se fija `activated_at`.
- **CA-4** — Dado un negocio `pending`, cuando lo rechazo, entonces ingreso un **motivo**, queda en estado `rejected` y el dueño es notificado con el motivo.
- **CA-5** — Dado cualquier negocio, cuando lo edito como admin, entonces puedo guardar cambios (RN de Negocios N-2).
- **CA-6** — Dada una reseña, cuando la oculto, entonces deja de verse en público y el rating se recalcula; al mostrarla, vuelve.
- **CA-7** — Dado un usuario, cuando lo desactivo, entonces se aplica la cascada; al reactivarlo, se revierte.
- **CA-8** — Dado que soy el **único admin**, cuando intento desactivarme o degradarme, entonces se bloquea (RN-5).
- **CA-9** — Dada cualquier acción de moderación, cuando la ejecuto, entonces queda registrada en el log de auditoría (RN-6).
- **CA-10** — Dado un cambio de configuración con una clave no reconocida, cuando lo envío, entonces se rechaza (RN-7).

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Dashboard | 🟡 | Conteos básicos; faltan reseñas del mes / nuevos usuarios / top categorías (AD-5). |
| US-2 Aprobar/rechazar | 🟡 | Aprobar ✅; **rechazar sin motivo y colapsa a `inactive`** (AD-1). `reject` sin 404 (AD-6). |
| US-3 Editar negocio | ❌ | No existe edición admin (= N-2). |
| US-4 Moderar reseñas | 🟡 | Ocultar/mostrar ✅ con `business_name`; **sin cola de reportadas/flaggeadas** (AD-4). |
| US-5 Gestión usuarios | 🟡 | Activar/desactivar (cascada) ✅, promover ✅, limpiar sospechoso ✅; **sin degradar** y **sin guarda de último admin** (AD-2). |
| US-6 Legales | ✅ | GET/PUT `/legal/{key}`. |
| US-7 Config | ✅ | GET/PUT `/config/{key}` con **whitelist** de las 2 claves reales (`review_rate_limit`, `boost_days`); panel de controles específicos; `boost_days` alimenta el badge "Nuevo" + boost de orden como fuente única (AD-7/AD-15, 2026-08-04). |
| US-8 Categorías | 🟡 | CRUD vive en `meta` (cruce C); proteger borrado en uso (C-4). |
| RN-6 Auditoría | ❌ | No hay log de acciones de admin (AD-3). |

## Decisiones tomadas (2026-06-20)

- **D-1** — Rechazar usa estado dedicado **`rejected`** + **motivo**, y notifica al dueño (NT-2). Toca el ciclo de vida de Negocios (cruce N-14). → AD-1.
- **D-2** — **Seguridad de admin**: guarda contra lockout (no desactivar/auto-desactivar/degradar al último admin) + agregar **degradar** admin→user. → AD-2.
- **D-3** — Agregar **log de auditoría** de acciones de admin. → AD-3.
- **D-4** — **Completar métricas** del dashboard (reseñas del mes, nuevos usuarios, top categorías). → AD-5.
- **D-5** — Admin **edita cualquier negocio** (= decisión de Negocios N-2). → US-3.
- **D-6** — Robustez confirmada: `reject` valida existencia (AD-6) y `config` con **whitelist** de claves (AD-7).
- **D-7** — **Cockpit de fundadora**: dashboard estratégico (activación, retención, heatmap categoría/ciudad, conversión). → AD-9.
- **D-8** — **Escalar moderación**: auto-aprobación de bajo riesgo + post-moderación + antigüedad/SLA de pendientes (AD-10); **visibilidad anti-spam** por dueño/velocidad (AD-11).
- **D-9** — **Moderación humana**: estado "necesita cambios" + mensajes admin→usuario (AD-12, cruce lifecycle + Notificaciones).
- **D-10** — **Gobernanza**: rol **moderador** (AD-13, cruce Auth roles), **2FA** admin (AD-14, cruce Auth), **simplificar config** (AD-15) y **repensar editor legal** (AD-16).
- **D-11** — Operación: **vista "tareas de hoy"** (AD-17), **export/backup** (AD-18) y **control destacado/verificado** (AD-19).
- **D-12** — **Bandeja de contacto** (formulario público → panel admin) (AD-20); **difusión in-app** + email opcional (AD-21, cruce Notificaciones NT-7); **monitor de cupos** versión simple (uso de Mongo + tarjeta de límites) (AD-22).
- **D-13** — **Admin crea negocio por el emprendedor** (diseño Opción B): **fuera de alcance por ahora**; se reevaluará cuando sembrar oferta sea prioridad.

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **AD-1** | Estado `rejected` + motivo en rechazo (+ notificación) | Medio | Cruce ciclo de vida Negocios (N-14) y Notificaciones (NT-2) |
| **AD-2** | Guarda de último admin (no lockout/auto-desactivación) + degradar admin→user | Bajo-Medio | Seguridad; contar admins activos antes de desactivar/degradar |
| **AD-3** | Log de auditoría de acciones de admin (quién/qué/cuándo) | Medio | Colección `audit_log`; rendición de cuentas |
| **AD-4** | Cola de reseñas reportadas/sospechosas en el panel | Medio | Cruce RV-8 (reporte de reseñas) |
| **AD-5** | Completar métricas (reseñas del mes, nuevos usuarios, top categorías) | Bajo-Medio | Ampliar `get_dashboard` |
| **AD-6** | `reject_business` valida existencia (404) | Bajo | Clase N-11 |
| **AD-7** | ✅ Whitelist de claves válidas en `config` PUT | Bajo | **Hecho (2026-08-04).** Reducida a `review_rate_limit` + `boost_days` (las que el código consume) |
| **AD-8** | Edición admin de cualquier negocio | Bajo | = N-2 (permiso del `PUT`) |
| **AD-9** | Cockpit de fundadora: activación, retención, heatmap categoría/ciudad, conversión | Alto | Dashboard estratégico; varias métricas/agregaciones |
| **AD-10** | Auto-aprobación de bajo riesgo + post-moderación + antigüedad/SLA de pendientes | Medio-Alto | Ataca R4 (cuello de botella); define criterios de "bajo riesgo" |
| **AD-11** | Vista anti-spam: inscripciones/reseñas por dueño + velocidad | Medio | Implementa R7 (patrón evidente) |
| **AD-12** | Estado "necesita cambios" + mensaje admin→usuario | Medio | Cruce ciclo de vida Negocios + Notificaciones (NT) |
| **AD-13** | Rol "moderador" (permisos acotados) | Medio | Rompe regla de 2 roles (cruce Auth RN-1) |
| **AD-14** | 2FA para cuentas admin/moderador | Medio | Cruce Auth (hoy 2FA estaba fuera de alcance) |
| **AD-15** | ✅ Simplificar config a controles específicos (quitar editor genérico) | Bajo | **Hecho (2026-08-04).** Panel con 2 controles reales; se eliminaron los campos muertos (`site_name`, `contact_email`, `max_businesses_free`) que no se leían ni guardaban |
| **AD-16** | Repensar editor legal (más amable o fuera del panel) | Bajo | El texto legal cambia rara vez |
| **AD-17** | Vista "tareas de hoy" (cola accionable) | Medio | Pendientes + reportadas + sospechosos + soporte en un solo lugar |
| **AD-18** | Export/backup de datos (negocios/usuarios/reseñas) | Bajo-Medio | Red de seguridad en M0 (sin backups gestionados) |
| **AD-19** | Control de `featured`/`is_verified`/`plan` desde el admin | Bajo | Campos ya existen; palanca de Fase 2 (monetización) |
| **AD-20** | Bandeja de soporte: formulario público (footer) → mensajes en el panel admin | Medio | Toca sitio público + admin; opción de responder por email |
| **AD-21** | Difusión/anuncios in-app (+ email opcional) | Medio | Cruce Notificaciones (NT-7, tipo broadcast) |
| **AD-22** | Monitor de cupos: uso de Mongo (`db.stats()`) + tarjeta de límites con links | Bajo | Sin integraciones pesadas a Cloudinary/Resend/Render |

## Priorización sugerida

- **MVP / pronto:** AD-1 (rejected+motivo), AD-2 (seguridad admin), AD-6, AD-7, AD-8, AD-15.
- **Medio plazo:** AD-3 (auditoría), AD-4 (cola reportadas), AD-5 (métricas), AD-10/AD-11 (escalar/anti-spam), AD-12 ("necesita cambios").
- **Fase 2 / mayor:** AD-9 (cockpit completo), AD-13 (rol moderador), AD-14 (2FA admin), AD-16, AD-19.
- **Operación (cuando aporte):** AD-17 (tareas de hoy), AD-18 (export), AD-20 (soporte), AD-21 (difusión), AD-22 (cupos).

## Fuera de alcance (por ahora)

- **Admin crea negocio por el emprendedor** (diseño Opción B, con invitación/claim por email). Se difiere hasta que sembrar oferta sea prioridad (D-13).
