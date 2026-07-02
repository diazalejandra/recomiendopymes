# e2e — Malla fina de tests (Playwright)

Red de seguridad de la **migración a Next.js** (ADR-0001). Cubre los flujos críticos —
sobre todo las **páginas públicas SEO**— para detectar regresiones al reescribir el frontend.

## Por qué vive en la raíz (y no en `frontend/`)

Los tests apuntan a la app **por URL**, no a su código, así que son **agnósticos del
framework**. Cuando el frontend pase de Vite (`frontend/`) a Next.js (`web/`), esta misma
malla se corre contra el nuevo app cambiando solo `PLAYWRIGHT_BASE_URL`. Así comparamos
"antes vs después" y confirmamos que no rompimos nada.

## Qué cubre hoy

| Archivo | Flujo |
|---|---|
| `tests/catalog.spec.js` | La home muestra el catálogo; el buscador filtra (wiring end-to-end). |
| `tests/business-detail.spec.js` | Home → ficha, con `title` dinámico + JSON-LD `LocalBusiness`; slug inexistente → "no encontrado". |
| `tests/news.spec.js` | El listado de noticias carga; un artículo renderiza con su meta. |
| `tests/auth-login.spec.js` | Login válido deja sesión iniciada; login inválido no. |

> **Aún NO cubre** (necesitan BD desechable + verificación de email): registro→verificación,
> inscribir negocio, dejar reseña. Se agregan en la Fase 3 de la migración (páginas privadas),
> idealmente contra una BD de prueba dedicada.

## Requisitos

1. **Backend** FastAPI en `http://localhost:8000` con **MongoDB sembrada** (`seed_data.py`) —
   los tests leen negocios/noticias/usuarios de prueba.
2. **Frontend** en `http://localhost:3000` (Playwright lo levanta solo si no está arriba).

## Correr localmente

```bash
# 1. Backend + frontend arriba (p.ej. desde la raíz):  .\start.ps1
# 2. En otra terminal:
cd e2e
npm install
npx playwright install chromium   # solo la primera vez
npm test
```

Contra otro entorno (p.ej. el futuro Next.js en :3001):

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm test
```

## Notas

- Credenciales de prueba (`maria.gonzalez@gmail.com` / `Contrasena123!`) provienen de
  `backend/seed_data.py`. No son de producción.
- En CI se orquesta Mongo + backend sembrado + frontend en el workflow antes de correr.
