# RecomiendoPymes

Catálogo web de micro-emprendedores chilenos. Permite a emprendedoras registrar su negocio y obtener visibilidad en buscadores; a clientes descubrir emprendimientos por categoría, ciudad o mapa; y a un administrador moderar el directorio.

> **Frontend en Next.js (App Router).** El frontend de producción vive en `web/` (Next.js,
> server-rendered para SEO — ver [ADR-0001](docs/architecture/decisions/0001-migracion-frontend-nextjs.md)).
> El SPA original de Vite (`frontend/`) se conserva como **fallback temporal** hasta retirarlo.
> El backend FastAPI se mantiene como API.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | FastAPI + Motor (async) + Pydantic v2 |
| Base de datos | MongoDB Atlas |
| Frontend | Next.js 15 (App Router) + React 19 + TailwindCSS + Shadcn/ui |
| Frontend (legacy) | React 19 + Vite (`frontend/`, fallback temporal) |
| Mapas | Leaflet / React-Leaflet (`dynamic ssr:false`) |
| Imágenes | Cloudinary |
| Emails | Resend |
| Deploy frontend | Vercel (Next.js) |
| Deploy backend | Render |

---

## Setup local

### Requisitos previos

- Python 3.11+
- Node.js 20+
- Una instancia de MongoDB (local o Atlas)
- Cuentas en Cloudinary y Resend (solo para upload de imágenes y emails)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Crea `backend/.env` con las siguientes variables:

```env
MONGO_URL=mongodb+srv://...
DB_NAME=recomiendopymes
SECRET_KEY=una-clave-secreta-larga-y-aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@recomiendopymes.cl
FRONTEND_URL=http://localhost:5173

CORS_ORIGINS=http://localhost:5173
```

Inicia el servidor:

```bash
cd backend
uvicorn server:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`. Documentación interactiva en `http://localhost:8000/docs`.

### Seed de datos

Para poblar la base de datos con 16 negocios de prueba:

```bash
cd backend
python seed_data.py
```

> El seed también crea un usuario admin. Revisa `seed_data.py` para las credenciales.

### Frontend (Next.js — `web/`)

```bash
cd web
npm install
npm run dev
```

El frontend queda en `http://localhost:3001`. **No necesita `.env` en local:** Next proxea
`/api` → `http://localhost:8000` (backend) vía `next.config.js`, y el fetch server-side usa
ese mismo backend por defecto. Para apuntar a otro backend en dev, `API_PROXY_TARGET` (proxy
del cliente) e `API_INTERNAL_URL` (fetch server-side).

> **e2e:** la malla Playwright (`e2e/`) corre contra el **build de producción** de Next
> (`cd web && npm run build`, luego `next start` en :3001), nunca contra `next dev`.
> Ver `e2e/README.md`.

### Frontend legacy (Vite — `frontend/`, fallback)

Se conserva por si hay rollback. Para levantarlo: `cd frontend && npm install && npm run dev`
(requiere `frontend/.env.local` con `VITE_API_URL=http://localhost:8000`). Se retirará cuando
la versión Next esté confirmada estable en producción.

---

## Deploy

### MongoDB Atlas

1. Crea un cluster gratuito en [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crea un usuario de base de datos con permisos de lectura/escritura
3. Agrega tu IP (o `0.0.0.0/0` para permitir todas) en Network Access
4. Copia la connection string al `MONGO_URL` del backend

### Backend (Render)

1. Conecta el repositorio en [render.com](https://render.com)
2. Crea un **Web Service** apuntando a la carpeta `backend/`
3. Configura:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Agrega todas las variables del `.env` en la sección Environment de Render
5. En `CORS_ORIGINS`, pon el dominio de Vercel: `https://recomiendopymes.vercel.app` (o tu dominio propio)

> **Plan gratuito:** El backend se duerme tras 15 minutos de inactividad. La primera request puede tomar 30–60 segundos.

### Frontend (Vercel — Next.js)

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. **Root Directory:** `web`
3. **Framework Preset:** `Next.js` (imprescindible — si queda en "Other"/Vite, el deploy
   falla con *"No Output Directory named public"*)
4. Variables de entorno (Production):
   | Variable | Valor |
   |---|---|
   | `API_PROXY_TARGET` | `https://api.recomiendopymes.cl` (backend; proxy same-origin del cliente) |
   | `API_INTERNAL_URL` | `https://api.recomiendopymes.cl/api` (fetch server-side, **server-only**) |
   | `NEXT_PUBLIC_SITE_URL` | `https://recomiendopymes.cl` (sitemap/canonical) |

   > **No** setear `NEXT_PUBLIC_API_URL`: el cliente debe usar `/api` relativo (mismo origen)
   > para que la cookie de refresh funcione. Detalles y runbook del cutover en
   > [`docs/PRODUCTION_ENV_GUIDE.md`](docs/PRODUCTION_ENV_GUIDE.md).

---

## Estructura del proyecto

```
recomiendopymes/
├── backend/
│   ├── core/           # Config, conexión DB, seguridad JWT
│   ├── modules/
│   │   ├── auth/       # Registro, login, verificación email, reset password
│   │   ├── business/   # CRUD emprendimientos, filtros, slugs
│   │   ├── review/     # Reseñas y respuestas del dueño
│   │   ├── media/      # Firma de uploads a Cloudinary
│   │   ├── admin/      # Dashboard, moderación, gestión usuarios
│   │   ├── meta/       # Categorías, ciudades, sitemap
│   │   └── news/       # Artículos (manual o vía n8n)
│   ├── server.py       # App factory, CORS, registro de routers
│   └── seed_data.py    # Script de datos de prueba
│
├── web/                        # Frontend de PRODUCCIÓN (Next.js, App Router)
│   ├── app/                    # Rutas: / (catálogo), /emprendimiento/[slug],
│   │   │                       #   /noticias, /categoria/..., /mapa, /admin/*,
│   │   │                       #   /mi-negocio/*, auth, sitemap.js, robots.js, icon.svg
│   ├── components/             # catalog, business, map, layout, news, ui (shadcn)
│   ├── hooks/useAuth.jsx       # Contexto de sesión (client)
│   ├── lib/api.js              # Fetch server-side (SSR/ISR) — API_INTERNAL_URL
│   ├── utils/api.js            # Cliente Axios autenticado — /api relativo (proxy)
│   └── next.config.js          # Proxy /api → backend (API_PROXY_TARGET)
│
├── frontend/                   # Frontend LEGACY (Vite) — fallback temporal
│   └── src/                    #   features/, hooks/, components/, utils/api.js
│
├── e2e/                        # Malla Playwright (corre contra el build de prod de web/)
│
└── docs/
    ├── PRODUCTION_ENV_GUIDE.md # Env vars de prod + runbook del cutover
    ├── requirements/           # Specs por módulo (fuente de verdad funcional)
    ├── architecture/decisions/ # ADRs (ADR-0001: migración a Next.js)
    ├── changelog/CHANGELOG.md
    └── superpowers/            # specs (diseño), plans (por fase), qa (pruebas)
```

## Roles y estados clave

**Roles de usuario:** `user` | `admin`  
Los administradores se crean por seed script, no hay registro público de admin.

**Estados de un emprendimiento:** `pending` → `active` | `inactive`  
Un negocio en `pending` no aparece en el catálogo público hasta que el admin lo aprueba.

**Tipos de negocio:** `online` | `physical` | `both`  
Solo los negocios `physical` o `both` con coordenadas aparecen en el mapa.
