# Spec — Panel de Administración

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
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

## Reglas de negocio

- **RN-1** — Todo el panel requiere `role: admin` (`require_admin`).
- **RN-2** — **Aprobar**: `pending → active`; fija `activated_at` la primera vez.
- **RN-3** — **Rechazar**: requiere **motivo**; usa un estado **dedicado `rejected`** (no se confunde con `inactive`); dispara notificación al dueño con el motivo (NT-2).
- **RN-4** — **Inactivar usuario** cascadea (oculta reseñas, negocios `active→inactive`); **reactivar revierte** la cascada (ver `01-auth` / decisión R8).
- **RN-5** — **No dejar el sistema sin admin**: bloquear desactivar/degradar al **último admin** y la **auto-desactivación**.
- **RN-6** — Toda acción de moderación/gestión queda en un **log de auditoría** (quién, qué, cuándo).
- **RN-7** — `config` y `legal` solo admin; `config` se valida contra **claves conocidas** (no aceptar cualquier clave).
- **RN-8** — Las reseñas **reportadas/sospechosas** se destacan en una cola para revisión.

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
| US-7 Config | 🟡 | GET/PUT `/config/{key}`; **acepta cualquier clave** (AD-7). |
| US-8 Categorías | 🟡 | CRUD vive en `meta` (cruce C); proteger borrado en uso (C-4). |
| RN-6 Auditoría | ❌ | No hay log de acciones de admin (AD-3). |

## Hallazgos / decisiones pendientes

- **AD-1 (decisión)** — Rechazar no guarda **motivo** y reutiliza `inactive`. ¿Agregamos estado **`rejected`** + motivo (y notificación)? *(decisión; toca el ciclo de vida de Negocios)*
- **AD-2 (seguridad, must-fix)** — Sin guarda contra **lockout de admin** (desactivar/auto-desactivar al último admin) y sin **degradar** admin. *(decisión + fix)*
- **AD-3 (gap)** — Sin **log de auditoría** de acciones de admin. ¿Lo agregamos? *(decisión)*
- **AD-4 (cruce)** — Sin cola de reseñas **reportadas/sospechosas** (depende de RV-8). 
- **AD-5 (mejora)** — Métricas del dashboard incompletas vs diseño (reseñas del mes, nuevos usuarios, top categorías).
- **AD-6 (robustez)** — `reject_business` no valida existencia (404→500; clase N-11).
- **AD-7 (robustez)** — `config` PUT acepta cualquier clave; conviene **whitelist** de parámetros válidos.
