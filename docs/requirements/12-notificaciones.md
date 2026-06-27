# Spec — Notificaciones (transversal)

> Estado del spec: **borrador para revisión** · 2026-06-20
> Transversal: sirve a Dashboard (DE-11), Reseñas, Admin y ciclo de vida del negocio.
> Base de diseño: tabla de feedback/estados (diseño §7b).

## Propósito

Mantener informados a los actores de eventos relevantes (estado de su negocio, nuevas
reseñas, cola de moderación) por **in-app** y **email**, para que no dependan de entrar a
revisar manualmente. Es la pieza que sostiene la retención del emprendedor.

## Actores y eventos (disparadores)

| Destinatario | Evento | Canal sugerido |
|---|---|---|
| Dueño | Negocio **aprobado** | in-app + email |
| Dueño | Negocio **rechazado** (con motivo) | in-app + email |
| Dueño | Negocio **desactivado por admin** | in-app + email |
| Dueño | **Nueva reseña** recibida | in-app (+ email opcional) |
| Usuario | El dueño **respondió** tu reseña | in-app |
| Admin | **Nuevo negocio pendiente** (cola) | in-app |
| Admin | Reseña **reportada** / usuario **sospechoso** | in-app |
| Usuario | Verificación de email / reset de contraseña | email _(ya existe)_ |

## Reglas de negocio

- **RN-1** — Cada notificación in-app tiene estado **leído/no leído**; el centro muestra un contador de no leídas.
- **RN-2** — Los emails son **best-effort** (un fallo del proveedor no rompe la operación) — patrón ya usado en Auth.
- **RN-3** — El usuario puede **optar por no recibir** ciertos emails no esenciales (preferencias); los transaccionales críticos (verificación, reset) no son opt-out.
- **RN-4** — Las notificaciones no incluyen **datos personales innecesarios** (minimización, Ley 21.719).
- **RN-5** — Los disparadores se emiten desde el evento de dominio correspondiente (aprobar negocio, crear reseña, etc.), no por polling.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado que un admin aprueba mi negocio, cuando ocurre, entonces recibo notificación in-app y email "tu emprendimiento fue aprobado".
- **CA-2** — Dado que un admin rechaza mi negocio, cuando ocurre, entonces recibo el **motivo**.
- **CA-3** — Dado que alguien reseña mi negocio, cuando se publica, entonces lo veo en mi centro de notificaciones.
- **CA-4** — Dado el centro de notificaciones, cuando abro una, entonces pasa a leída y el contador baja.
- **CA-5** — Dado que desactivo el email de "nueva reseña", cuando recibo una reseña, entonces no me llega email (pero sí in-app).
- **CA-6** — Dado un nuevo negocio pendiente, cuando ocurre, entonces el admin lo ve señalado en su panel.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| Emails transaccionales (verificación, reset) | ✅ | Resend, best-effort. |
| Notificación de aprobación/rechazo al dueño | ❌ | No existe. |
| Notificación de nueva reseña | ❌ | No existe. |
| Centro de notificaciones in-app (leído/no leído) | ❌ | No existe. |
| Señal de cola al admin | 🟡 | El dashboard admin muestra contador de pendientes, pero no es una notificación. |
| Preferencias de notificación | ❌ | No existen. |

## Backlog derivado

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **NT-1** | Modelo + centro in-app (leído/no leído + contador) | Medio | Colección `notifications`; API listar/marcar leído |
| **NT-2** | Disparadores de ciclo de vida del negocio (aprobado/rechazado/desactivado) | Medio | Email + in-app; el rechazo incluye motivo |
| **NT-3** | Disparador de nueva reseña al dueño | Bajo | in-app (+ email opcional) |
| **NT-4** | Disparador de respuesta del dueño al autor de la reseña | Bajo | in-app |
| **NT-5** | Señales para el admin (pendientes, reportes, sospechosos) | Medio | in-app |
| **NT-6** | Preferencias de notificación (opt-out de no esenciales) | Bajo-Medio | Respeta transaccionales críticos |

## Roadmap (futuro)

- Notificaciones push (web push / móvil) y digest por email (resumen semanal).
