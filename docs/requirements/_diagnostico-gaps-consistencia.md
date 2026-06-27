# Diagnóstico de specs — Gaps y Consistencia

> 2026-06-20 · Revisión transversal de los 12 specs (`01`–`12`). Dos partes:
> (1) gaps no observados (negocio + técnico); (2) inconsistencias entre specs.

---

## Parte 1 — Gaps (lo que no está en ningún spec)

### Negocio / producto

| ID | Gap | Por qué importa |
|---|---|---|
| **G1** | **No hay spec de Monetización.** `featured`/`is_verified`/`plan` y `modules/payments/` están como placeholders; AD-19 controla flags, pero **no existe el modelo de ingresos** (qué es free vs pago, planes, precios, flujo de pago). | Es **la** pregunta de negocio. Sin esto no hay sustentabilidad; conviene al menos un spec aunque la ejecución sea Fase 2. |
| **G2** | **No se miden leads/conversión.** Solo `view_count` (inflado). No se cuentan clics a **WhatsApp/Instagram/web** desde la ficha. | Es **el valor real para el emprendedor** (leads, no vistas). Sin esto no puedes demostrar ROI ni cobrar después. |
| **G3** | **Favoritos / seguir negocios** (usuario logueado). | Retención del lado demanda; hoy el visitante no tiene razón para volver ni crear cuenta (salvo reseñar). |
| **G4** | **Horarios de atención** + datos ricos de `LocalBusiness` (openingHours, priceRange). | Negocio (físicos) + **SEO**: habilita rich results y "abierto ahora". |
| **G5** | **Propuesta de valor / onboarding del visitante** (qué es el sitio, cómo usarlo). | Conversión de visitantes nuevos; hoy no es un spec. |
| **G6** | **Compartir ficha** desde el lado del visitante (no solo el kit del dueño DE-9). | Viralidad orgánica. |

### Técnico / operación

| ID | Gap | Por qué importa |
|---|---|---|
| **G7** | **Sin estrategia de testing.** Hay 1–2 tests; no hay estándar (unit/integration/e2e). | Vamos a hacer una **migración a Next.js** + ~100 ítems de backlog: sin tests, cada cambio es riesgoso. El ADR dice "specs = red de seguridad", pero los **tests** la hacen cumplir. |
| **G8** | **Sin CI/CD.** No corren tests en PR, no hay checks automáticos. | Con este volumen de cambios, integrar a ciegas es frágil. |
| **G9** | **Sin observabilidad/monitoreo.** No hay tracking de errores (Sentry), logs centralizados ni alertas de uptime (Render se duerme). | En producción, los errores son invisibles hasta que alguien reclama. AD-22 (cupos) es solo una parte. |
| **G10** | **Accesibilidad (a11y) transversal.** Solo se menciona en el mapa. | UX inclusiva + posible requisito; el público es amplio y móvil. |
| **G11** | **Estrategia de migración de datos.** Varios cambios de modelo en backlog (`rejected`, quitar `active_offer`, tz-aware, `tipo` de noticias, `tags`). | Sin un enfoque, los datos existentes quedan inconsistentes al cambiar enums/campos. |
| **G12** | **Rate limiting / anti-abuso global.** Cubierto por partes (login, registro, reseñas, negocios); falta una política transversal. | Defensa de cupos free-tier y de abuso. |

**Los 3 gaps de mayor impacto:** **G1 (monetización)** y **G2 (leads/conversión)** en negocio; **G7 (testing)** en técnico (crítico por la migración inminente).

---

## Parte 2 — Inconsistencias entre specs

> **Estado: C1–C7 reconciliadas el 2026-06-20** (ediciones aplicadas en los specs respectivos).

| ID | Inconsistencia | Specs en conflicto | Reconciliación propuesta |
|---|---|---|---|
| **C1** | **Orden del catálogo definido en 3 lugares.** Negocios RN-10 describe `featured→nuevos→rating→antigüedad`, pero no absorbe la **cercanía** (Mapa RN-12) ni el **rating ponderado** (Reseñas RV-10). | 02 (RN-10), 05 (RN-12), 04 (RV-10) | **Negocios es el dueño del orden**: actualizar RN-10 para que integre cercanía (niveles) + rating ponderado + tiebreaker `_id` (N-6) en **una** definición. |
| **C2** | **Contradicción de roles.** Auth dice "solo dos roles (admin/user)"; Admin propone un rol **moderador**. | 01 (RN-1) vs 07 (AD-13) | Si se adopta moderador, **actualizar Auth RN-1** a 3 roles (o marcar AD-13 explícitamente como cambio futuro que reabre RN-1). |
| **C3** | **Máquina de estados del negocio no unificada.** Base: `pending/active/inactive`; se agregan `rejected` (N-14) y `archived` (soft-delete N-3), pero RN-4 ("solo `active` se muestra") y la visibilidad no contemplan los nuevos estados. | 02 (RN-3/4/7), 07 (AD-1), 02 (N-3/N-14) | Definir **un diagrama de estados único** y actualizar reglas de visibilidad/catálogo para excluir `rejected`/`archived`. |
| **C4** | **Categorías: el spec miente sobre la realidad.** 03 dice "Colección + CRUD ✅"; SEO (SE-3) confirma que `/api/categories` está **hardcodeado** en `meta/router.py` (con "Clothing y Moda"). | 03 (estado) vs 09 (SE-3) / código | Corregir el estado de 03: categorías **hardcodeadas hoy**; decidir si pasan a colección con CRUD real (lo que asume el admin). |
| **C5** | **Mapa subestima datos existentes.** MP-12 plantea "asegurar comuna→región" como incógnita, pero `REGIONS_DATA` (región→comunas) **ya existe** en `meta/router.py`. | 05 (MP-12) vs código | Actualizar MP-12: el dato existe; solo falta exponer/usar el mapeo inverso comuna→región. |
| **C6** | **Borrado de cuenta → negocios sin definir.** B-7 (borrar cuenta) + RV-7 (anonimizar reseñas) están; pero qué pasa con **los negocios del usuario** al borrar la cuenta no está explícito (N-3 es soft-delete por admin). | 01 (B-7), 04 (RV-7), 02 (N-3) | Definir la cascada de borrado de cuenta sobre negocios (archivar/anonimizar). |
| **C7** | **`tags` sin reflejar en Negocios.** Categorías C-2 agrega `tags` al negocio; el spec/modelo de Negocios no lo menciona. | 03 (C-2) vs 02 | Agregar `tags` al modelo en el spec de Negocios. |

Ninguna es bloqueante, pero **C1, C3 y C4** son las que más confunden a quien implemente (orden, estados y categorías son núcleo).

---

## Recomendaciones

1. **Crear spec de Monetización (13)** — aunque la ejecución sea Fase 2, el modelo de ingresos merece estar escrito (G1).
2. **Crear spec/estándar de Calidad y Operación** — testing + CI + observabilidad (G7/G8/G9), crítico antes de la migración Next.js.
3. **Agregar al backlog de Negocios:** leads/conversión (G2), horarios + LocalBusiness rico (G4), favoritos (G3).
4. **Aplicar las reconciliaciones C1–C7** (ediciones baratas en los specs): definición única de orden, máquina de estados, corregir estado de categorías, etc.
