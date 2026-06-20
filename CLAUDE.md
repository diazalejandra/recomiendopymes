# CLAUDE.md

Guía para trabajar en **RecomiendoPymes**. Léela antes de tocar código.

## Qué es

Catálogo web de micro-emprendedores chilenos. Propuesta de valor: dar visibilidad
en buscadores (Google) a emprendedores que venden por redes sociales y no tienen
sitio propio. Es una **vitrina SEO + directorio confiable con reseñas autenticadas**.
**No es** un e-commerce con carrito.

Idioma del producto: **español de Chile**. Toda la UI, mensajes de error de la API y
seed data deben estar en español.

## Stack

- **Backend:** FastAPI + MongoDB (motor async) + Pydantic v2. JWT stateless (HS256).
- **Frontend:** React 19 + Vite + TailwindCSS + Radix/shadcn. React Router 7.
- **Infra free-tier:** MongoDB Atlas (M0), Cloudinary (imágenes), Resend (emails),
  Leaflet + OpenStreetMap (mapa), Nominatim (geocodificación).
- **Deploy:** Backend en Render, Frontend en Vercel.

## Cómo correr (local, Windows)

```powershell
.\start.ps1
```

Levanta backend (FastAPI, puerto 8000) y frontend (Vite) en ventanas separadas, mata
procesos zombie del puerto 8000 y limpia el bytecode `__pycache__`. Detener: `Ctrl+C`
en cada ventana.

Manual:
- Backend: `cd backend && python -m uvicorn server:app --reload --port 8000`
- Frontend: `cd frontend && npm run dev`
- API docs: `http://localhost:8000/docs` (deshabilitado en producción)
- Tests backend: `cd backend && pytest` (ver `backend/tests/`)

> El `.env` del backend vive en `backend/`. En dev se recomienda **dejar
> `RESEND_API_KEY` vacía**: el sistema entra en modo simulación e imprime los enlaces
> de verificación/reset en la consola del backend en vez de enviar emails.

## Arquitectura

### Backend (`backend/`)
- `core/` — `config.py` (settings pydantic), `database.py` (conexión Mongo),
  `security.py` (JWT).
- `modules/<dominio>/` — cada dominio tiene `models.py`, `service.py`, `router.py`
  (y `dependencies.py` en auth). Dominios: `auth`, `business`, `review`, `media`,
  `admin`, `meta`, `news`, `payments` (placeholder Fase 2).
- `server.py` — app factory `create_app()`: registra routers, CORS, rate limiting,
  security headers, e índices Mongo en el `lifespan`.
- `seed_data.py` — datos de prueba.

### Frontend (`frontend/src/`)
- `features/<dominio>/` — organización feature-based: `catalog`, `business`, `auth`,
  `entrepreneur`, `admin`, `news`.
- `components/ui/` — primitivos shadcn/Radix. `components/` — `AppLayout`, `ProtectedRoute`.
- `hooks/useAuth.jsx` — contexto de autenticación global.
- `utils/api.js` — cliente axios + interceptores.

## Modelo de dominio (lo esencial)

- **Roles:** solo `admin` y `user`. **"Emprendedor" NO es un rol** — se determina por
  `owner_user_id` en el negocio (1 usuario → N negocios).
- **Ciclo de vida del negocio:** `pending` → (admin aprueba) → `active` ⇄ `inactive`.
  `activated_at` se setea al aprobar; alimenta el badge "🆕 Nuevo" (30 días).
- **Reseñas:** requieren email verificado; un usuario no puede reseñar su propio
  negocio. Se publican de inmediato. Admin oculta con `is_visible: false` (no borra).
- **Slug SEO:** único, generado del nombre al crear; **no se regenera** si cambia el
  nombre. Por eso el emprendedor no puede editar el nombre del negocio.
- **Inactivar usuario** cascadea: oculta sus reseñas y pasa sus negocios a `inactive`
  (no se borra nada; reactivar NO revierte la cascada automáticamente).

## Convenciones

- **Fechas:** usar `datetime.now(timezone.utc)` (timezone-aware), **nunca**
  `datetime.utcnow()` (deprecado).
- **Mensajes de error de API:** en español, vía `HTTPException`.
- **Negocios no-`active`** (pending/inactive) solo son visibles por su dueño o un admin;
  para el resto devuelven 404.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `style:`).

## Documentación viva (`docs/`)

`docs/` es la fuente de verdad funcional/técnica. Antes de un feature, actualizar
`requirements/`. Decisiones técnicas → ADR en `architecture/`. Cada release → entrada en
`changelog/CHANGELOG.md`. Diseño completo del producto:
`docs/superpowers/specs/2026-04-11-recomiendopymes-design.md`. QA en producción:
`docs/superpowers/qa/`. Variables de entorno y reglas de deploy:
`docs/PRODUCTION_ENV_GUIDE.md`.

## Seguridad / producción (ver `PRODUCTION_ENV_GUIDE.md`)

- `ENVIRONMENT=production` activa: cookies `Secure`, docs ocultas, etc.
  En dev queda `development`.
- `FRONTEND_URL` debe apuntar al dominio público en producción — si queda en
  `localhost`, los enlaces de los emails se rompen.
- Resend exige el dominio `recomiendopymes.cl` verificado (SPF/DKIM) para no rebotar.
- Vercel necesita `frontend/vercel.json` con rewrites para que el SPA no dé 404 en
  subrutas.
- Rate limiting por IP (slowapi) en endpoints sensibles de auth (registro,
  recuperación de contraseña).
