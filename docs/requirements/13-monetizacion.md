# Spec — Monetización (Fase 2)

> Estado del spec: **borrador estratégico** · 2026-06-20 · Ejecución **Fase 2** (no MVP)
> Backend: `modules/payments/` (placeholder) · Campos ya reservados en Negocios: `featured`, `featured_until`, `is_verified`, `plan`, `plan_expires_at`.

## Propósito

Definir un **modelo de ingresos sustentable** sin romper la confianza ni el SEO. El
catálogo base debe seguir **gratis** (para tener oferta y tráfico); se cobra por **valor
añadido**: visibilidad, confianza y herramientas.

## Principios

- **P-1** — El catálogo y la ficha base son **gratis** (la oferta y el SEO dependen de ello).
- **P-2** — Se cobra por **valor incremental**, no por aparecer.
- **P-3** — **Transparencia**: lo pagado (destacado) se marca como tal; no se engaña al visitante.
- **P-4** — Pagar **no oculta** a los negocios free del catálogo (no "pay-to-be-seen-at-all").
- **P-5** — El destacado **no degrada la relevancia**: respeta el orden por cercanía/rating dentro de lo razonable (cruce Negocios RN-10).

## Líneas de ingreso (de menor a mayor complejidad)

| ID | Producto | Qué incluye | Complejidad |
|---|---|---|---|
| **MO-1** | **Listado destacado** (`featured`) | Posición prioritaria + badge "✨ Destacado", por tiempo (`featured_until`). Pago mensual. | Baja — primer paso |
| **MO-2** | **Perfil verificado** (`is_verified`) | Badge de identidad validada. Puede ser gratis (calidad) o pago. | Baja-Media |
| **MO-3** | **Plan Pro** (`plan`) | Más imágenes en galería, **estadísticas de leads/visitas** (N-15), WhatsApp destacado, sin límites free. | Media |
| **MO-4** | **Publicidad contextual** | Banners en búsquedas por categoría. | Alta — Fase 3+ |

## Pasarela de pago — ⚠️ decisión clave (Chile)

El diseño menciona Stripe, pero **Stripe tiene cobertura/condiciones limitadas en Chile**.
Para PYMES chilenas conviene evaluar pasarelas **locales**:
- **Transbank Webpay** (estándar local, tarjetas chilenas), **Flow**, **Khipu** (transferencia), **Mercado Pago**.
- **MO-5** — Decidir pasarela según comisiones, onboarding y soporte de pagos recurrentes (suscripción).

## Reglas de negocio

- **RN-1** — `featured` solo ordena prioritario **mientras `featured_until > now`**; al expirar vuelve al orden normal (Negocios R-1).
- **RN-2** — Los upsells se muestran **en contexto** (dashboard, al topar un límite free), no en páginas genéricas (diseño Fase 2).
- **RN-3** — El admin puede otorgar/revocar `featured`/`is_verified`/`plan` manualmente (AD-19) — útil antes de tener pagos automáticos.
- **RN-4** — Estados de suscripción (activa, vencida, cancelada) y su efecto en los beneficios deben ser explícitos.

## Free vs. Pago (borrador)

| Capacidad | Free | Pro |
|---|---|---|
| Ficha, catálogo, mapa, reseñas | ✅ | ✅ |
| Galería | hasta N | más |
| Estadísticas de leads/visitas | básica | completa |
| Destacado / posición | — | ✅ (o add-on) |
| Verificado | según política | ✅ |

## Estado vs código

- Campos `featured`/`is_verified`/`plan`/`*_expires_at` **existen** en el modelo (reservados Fase 1).
- `modules/payments/` es **placeholder** (sin lógica).
- **No hay** flujo de pago, suscripciones, ni control de expiración automático.
- Control admin de flags: pendiente (AD-19).

## Backlog (Fase 2)

| ID | Item | Notas |
|---|---|---|
| **MO-1** | Listado destacado + badge + expiración en el orden | Primer producto; cruce Negocios R-1 |
| **MO-2** | Verificación de identidad + badge | Política gratis/pago |
| **MO-3** | Plan Pro (galería+, stats de leads, WhatsApp destacado) | Depende de N-15 (leads) |
| **MO-4** | Publicidad contextual | Fase 3 |
| **MO-5** | **Elegir pasarela de pago (local CL)** + suscripciones recurrentes | Evaluar Webpay/Flow/Khipu/MercadoPago vs Stripe |
| **MO-6** | Gestión de suscripciones (estados, expiración automática, recibos) | Cron de expiración |
| **MO-7** | Upsells contextuales en el dashboard | Cruce Dashboard R-2 |
