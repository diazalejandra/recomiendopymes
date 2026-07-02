# Spec — Calidad y Operación (transversal)

> Estado del spec: **borrador para revisión** · 2026-06-20
> Transversal: testing, CI/CD, observabilidad, migración de datos y rendimiento.

## Propósito

Asegurar que el producto sea **confiable y mantenible** mientras se ejecuta un backlog
grande y, sobre todo, la **migración a Next.js (ADR-0001)**. Sin red de tests + CI, cada
cambio es un riesgo; sin observabilidad, los errores en producción son invisibles.

## Reglas / estándares

- **RN-1 — Testing por capas:**
  - **Backend (pytest):** unit + integration con el fake-DB async ya iniciado; cubrir los
    flujos **críticos y de seguridad** (auth, acceso a negocios no-active, reseñas, cascada
    admin, rate limits, consentimiento).
  - **Frontend:** component tests (Vitest + Testing Library) para lógica clave y **e2e
    (Playwright)** para los flujos principales (registro→verificación, inscribir, reseñar,
    aprobar como admin).
- **RN-2 — CI:** en cada PR correr **lint + tests + build**; bloquear merge si fallan
  (GitHub Actions).
- **RN-3 — CD:** deploy automático desde `main` (Vercel front, Render back) **con checks**;
  no romper producción por un merge a ciegas.
- **RN-4 — Observabilidad:** error tracking (p. ej. **Sentry** free), logs útiles, y
  **monitoreo de uptime** (p. ej. UptimeRobot) — relevante por el **cold-start de Render**.
- **RN-5 — Calidad de código:** linter/formato (ESLint/Prettier en front; ruff/black en
  back) y las convenciones del `CLAUDE.md`.
- **RN-8 — Seguridad de dependencias:** mantener las dependencias sin vulnerabilidades
  conocidas de severidad alta. Revisar `npm audit` (front) / `pip-audit` (back)
  periódicamente y en CI; aplicar parches semver-compatibles pronto y planificar los
  cambios mayores. Distinguir vulnerabilidades **de runtime** (exposición real en
  producción, p. ej. `axios`) de las **solo-dev/build** (p. ej. dev-server de `vite`),
  que no exponen producción pero igual se corrigen.
- **RN-6 — Migración de datos:** todo cambio de modelo (estados `rejected`/`archived`,
  quitar `active_offer`, tz-aware, `tipo` de noticias, `tags`) define cómo se **migran los
  datos existentes** (script idempotente o default seguro).
- **RN-7 — Rendimiento / Core Web Vitals:** presupuesto de performance (cruce SEO SE-7);
  lazy-loading, tamaño de bundle, caché del catálogo.

## Criterios de aceptación

- **CA-1** — Dado un PR, cuando se abre, entonces CI corre lint+tests+build y bloquea el merge si algo falla.
- **CA-2** — Dado un error en producción, cuando ocurre, entonces queda registrado en el tracker con stack y contexto.
- **CA-3** — Dado que el backend se durmió (Render), cuando un monitor lo detecta, entonces hay alerta/registro.
- **CA-4** — Dado un cambio de modelo, cuando se despliega, entonces los datos existentes quedan consistentes (migración aplicada).
- **CA-5** — Dada la migración a Next.js, cuando se reescribe un flujo, entonces sus tests (de su spec) siguen pasando.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| Tests backend | 🟡 | Existen unos pocos (pytest + fake-DB); falta cobertura de lo crítico. |
| Tests frontend | ❌ | No hay. |
| CI/CD | ❌ | Sin pipeline; deploys auto sin checks. |
| Observabilidad | ❌ | Sin error tracking ni uptime monitor. |
| Lint/formato | ❓ | Verificar configuración existente. |
| Migración de datos | ❌ | Sin enfoque para cambios de modelo. |
| Seguridad de deps | 🟡 | `npm audit` reporta 8 (5 altas): axios, react-router, vite, postcss, form-data, follow-redirects, @babel/core. Todas con fix semver-compatible. |

## Backlog

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **QA-1** | Cobertura de tests backend en flujos críticos/seguridad | Medio | Sobre el fake-DB ya iniciado |
| **QA-2** | Tests frontend (Vitest/RTL) + e2e (Playwright) de flujos clave | Medio-Alto | Red de seguridad para la migración Next.js |
| **QA-3** | CI en PR (lint + tests + build) | Bajo-Medio | GitHub Actions |
| **QA-4** | Observabilidad: Sentry + uptime monitor | Bajo | Cold-start de Render |
| **QA-5** | Estándar de migración de datos + scripts por cambio de modelo | Medio | Estados, active_offer, tz, tags |
| **QA-6** | Presupuesto de performance / CWV | Bajo | Cruce SEO SE-7 |
| **QA-7** | Auditoría de dependencias (`npm audit` / `pip-audit`) + parche | Bajo | 8 vulns (5 altas) hoy; fix semver-compatible. Sumar `npm audit` como paso no bloqueante en CI |

> **Prioridad:** QA-1/QA-2/QA-3 **antes o junto con** la migración a Next.js — son la red de
> seguridad que el ADR-0001 asume.
