# Backlog consolidado y priorizado

> 2026-06-20 · Cruza el backlog de los 14 specs (~120 ítems) en **orden de ataque**.
> Cada ID enlaza conceptualmente a su spec (`B-*` auth, `N-*` negocios, `C-*` categorías,
> `RV-*` reseñas, `MP-*` mapa, `DE-*` dashboard, `AD-*` admin, `NW-*` noticias, `SE-*` seo,
> `L-*` legal, `ME-*` media, `NT-*` notificaciones, `MO-*` monetización, `QA-*` calidad).

## Clave de secuenciamiento

La **migración a Next.js (SE-1, ADR-0001)** reordena las prioridades:
- El **backend** (seguridad, modelo, lógica) es **independiente** de la migración → va primero.
- Gran parte del **frontend y SEO** conviene hacerlo **durante/después** de la migración, para
  no reescribir dos veces.
- **Calidad/CI (QA-*)** es **prerequisito** de la migración (red de seguridad del ADR).

## Ya implementado (base)
Endurecimiento de producción (datetimes tz-aware, security headers, control de acceso a
negocios pending/inactive, cookies por entorno), **B-5** (rate limit login), **B-6**
(consentimiento T&C en registro), render Markdown de legales, y dominio/SSL/emails en prod.

---

## 🔴 P0 — Crítico (backend, ya, independiente de la migración)
Seguridad, costo (cupos free-tier), datos y confianza. Son rápidos y protegen producción.

| Área | Ítems |
|---|---|
| Media | **ME-1** firma autenticada · **ME-3** validar tamaño/tipo · **ME-4** validar URLs Cloudinary |
| Noticias | **NW-1** webhook fail-closed |
| Reseñas | **RV-1** bloquear auto-reseña · **RV-3** validar respuesta dueño · **RV-6** DuplicateKeyError · **RV-12** rate limit |
| Admin | **AD-2** guarda de último admin + degradar · **AD-6** reject 404 · **AD-7** whitelist config |
| Negocios | **N-10** reintento slug · **N-11** id inválido→404 |
| Auth | **B-3** /refresh revalida is_active · **B-4** modelo de registro limpio |
| Verificación (1 trabajo) | **N-1 / RV-2 / DE-2 / DE-3** — aplicar `require_verified` a inscribir/editar/responder |
| Limpieza | **N-5** quitar código muerto |

## 🟠 P1 — Fundaciones (calidad + migración)
| Tema | Ítems |
|---|---|
| Calidad (prereq.) | **QA-1** tests backend críticos · **QA-3** CI en PR · **QA-4** observabilidad · **QA-5** estándar de migración de datos |
| **Migración Next.js (SE-1)** | absorbe: **SE-2** sitemap/robots · **SE-4** JSON-LD geo + Article · **SE-5** canonical · **SE-6** páginas categoría/ciudad · **SE-7** lang/CWV · **NW-18/NW-5** preview social + Article · rework auth a cookies `httpOnly` · **B-9** homologar UI auth · **DE-12** mobile-first · **MP-6** unificar mapa |
| Durante la migración | **QA-2** tests frontend + e2e |

## 🟡 P2 — Núcleo de producto (modelo, lógica, consistencia)
| Área | Ítems |
|---|---|
| Estados negocio | **N-14/AD-1** rejected + motivo · **N-17/N-3** archived (soft-delete) |
| Categorías | **C-3/SE-3/N-9** fuente única + enforce + corregir "Clothing y Moda" · **C-1** sembrar lista curada · **C-4** proteger borrado en uso · **C-2** tags · **C-5** filtro por tags |
| Orden y búsqueda | **N-6** orden estable · **N-7** cap limit · **N-8** índice de texto/sin acentos · **RV-10** rating ponderado |
| Negocios | **N-2/AD-8** admin edita · **N-4** galería 8 · **N-12** validar coords · **N-13/DE-13** quitar `active_offer` |
| Mapa | **MP-1** íconos locales · **MP-2** geocoding proxy+caché · **MP-3** filtrar por tipo · **MP-4** íconos desde categorías · **MP-5** is_exact · **MP-7** granularidad por tipo · **MP-8** geoloc con control · **MP-9** "cerca de ti" · **MP-10** geo JSON-LD · **MP-11** tiles OSM · **MP-12** comuna→región |
| Reseñas | **RV-4** ventana config · **RV-5** editar/eliminar propia · **RV-7** anonimizar/ocultar · **RV-8** reportar · **RV-9** filtro contenido · **RV-11** nombre+inicial |
| Admin | **AD-3** auditoría · **AD-4** cola reportadas · **AD-5** métricas · **AD-10** auto-aprobación/SLA · **AD-11** anti-spam por dueño · **AD-12** "necesita cambios" · **AD-19** control featured/verified |
| Dashboard | **DE-1** nombre solo lectura · **DE-5** desactivar/reactivar · **DE-6** /mi-cuenta (+B-1) · **DE-7** degradar ubicación · **DE-8** visitas aprox · **DE-10** acciones sugeridas |
| Auth | **B-1** cambio pass/email · **B-7** borrado ARCO + cascada · **B-8** anti-enumeración + revocación |
| Noticias | **NW-2** slug único · **NW-3** paginación · **NW-4** publicación programada · **NW-6** secciones controladas · **NW-7** fecha consistente · **NW-12** hosted/link · **NW-13** fuentes enchufables · **NW-17/ME-5** imagen Cloudinary |

## 🟢 P3 — Valor / retención
| Tema | Ítems |
|---|---|
| Notificaciones (sistema) | **NT-1..NT-7** (centro in-app, disparadores, preferencias, broadcast) |
| Difusión | **DE-9** kit de difusión · **NW-10** difusión por artículo · **AD-21** anuncios |
| Cockpit / operación admin | **AD-9** cockpit fundadora · **AD-17** tareas de hoy · **AD-18** export/backup · **AD-20** bandeja de soporte · **AD-22** monitor de cupos |
| Leads / negocio | **N-15** clics WhatsApp/IG · **N-16** horarios/LocalBusiness |
| Contenido | **NW-8** historias de emprendedores · **NW-9** recursos evergreen · **NW-11** guardrail IA · **NW-14** directorio fondos · **NW-15/NW-16** anti-duplicado/atribución |
| Dashboard | **DE-4** badge reseñas sin responder |

## 🔵 P4 — Fase 2 / roadmap
| Tema | Ítems |
|---|---|
| Monetización | **MO-1..MO-7** (destacado, verificado, Pro, ads, **MO-5 pasarela CL**, suscripciones, upsells) |
| Gobernanza | **AD-13** rol moderador · **AD-14** 2FA admin |
| Escala | Mapa (clustering, viewport) · Negocios (keyset, view_count off-read, caché) · Reseñas (review bombing) |

## 👤 Tu acción (no es código)
- **L-3** revisión por abogado/a · **L-1/L-2** completar razón social/RUT (al formalizar) · **L-5** confirmar fechas/sanciones en BCN.
- **MO-5** decidir pasarela de pago (Webpay/Flow/Khipu/Mercado Pago).
- Cumplimiento legal con apoyo profesional: **L-6** cookies · **L-7** acceso/portabilidad · **L-8** re-consentimiento · **L-9** takedown · **L-10** registro de tratamiento + brechas · **L-11** transparencia de reseñas.

---

## Primer sprint sugerido (arranque concreto)
Todo backend, alto impacto, bajo esfuerzo, sin depender de la migración — y con tests (QA-1):
1. **ME-1** firma de media autenticada (cierra abuso de cupo).
2. **RV-1** bloquear auto-reseña (confianza).
3. **NW-1** webhook fail-closed (seguridad).
4. **AD-2** guarda de último admin (evita lockout).
5. **N-1/RV-2/DE-2/DE-3** aplicar `require_verified` (consistencia/seguridad).
6. **N-10/N-11/RV-6/AD-6/AD-7/ME-3/ME-4/B-3/B-4** robustez varia.
7. **QA-1 + QA-3** tests de todo lo anterior + CI.

Con eso cierras los huecos de seguridad/abuso y montas la red de tests **antes** de entrar a la migración Next.js (P1).
