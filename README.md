# RecomiendoPymes

Catálogo web de micro-emprendedores chilenos. Permite a emprendedoras registrar su negocio y obtener visibilidad en buscadores; a clientes descubrir emprendimientos por categoría, ciudad o mapa; y a un administrador moderar el directorio.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | FastAPI + Motor (async) + Pydantic v2 |
| Base de datos | MongoDB Atlas |
| Frontend | React 19 + Vite + TailwindCSS + Shadcn/ui |
| Mapas | Leaflet / React-Leaflet |
| Imágenes | Cloudinary |
| Emails | Resend |
| Deploy frontend | Vercel |
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

### Frontend

```bash
cd frontend
npm install
```

Crea `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend queda en `http://localhost:5173`.

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

### Frontend (Vercel)

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Configura el **Root Directory** como `frontend`
3. Agrega la variable de entorno:
   - `VITE_API_URL` = URL de tu servicio en Render (sin slash al final)
4. Vercel detecta Vite automáticamente y configura el build

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
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── catalog/       # HomePage, BusinessCard, MapView
│       │   ├── business/      # BusinessDetail, ReviewForm, ReviewItem
│       │   ├── auth/          # Login, Registro, VerifyEmail, ResetPassword
│       │   ├── entrepreneur/  # Dashboard emprendedor, edición, reseñas
│       │   ├── admin/         # Panel admin completo
│       │   └── news/          # NewsGrid, NewsDetail
│       ├── hooks/             # useAuth, useInfiniteScroll
│       ├── components/        # AppLayout, ProtectedRoute, Shadcn/ui
│       └── utils/api.js       # Cliente Axios con interceptores JWT
│
└── docs/superpowers/
    ├── specs/          # Diseño del producto
    ├── plans/          # Planes de implementación por fase
    └── qa/             # Plan de pruebas funcionales
```

## Roles y estados clave

**Roles de usuario:** `user` | `admin`  
Los administradores se crean por seed script, no hay registro público de admin.

**Estados de un emprendimiento:** `pending` → `active` | `inactive`  
Un negocio en `pending` no aparece en el catálogo público hasta que el admin lo aprueba.

**Tipos de negocio:** `online` | `physical` | `both`  
Solo los negocios `physical` o `both` con coordenadas aparecen en el mapa.
