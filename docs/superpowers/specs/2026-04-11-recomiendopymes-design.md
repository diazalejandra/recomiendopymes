# RecomiendoPymes — Diseño del Producto Completo

**Fecha:** 2026-04-11  
**Estado:** Aprobado por el usuario — listo para plan de implementación
**Última revisión:** 2026-04-11 (reseñas, ranking nuevos, feedback visual, riesgos y mitigaciones)

---

## Resumen del producto

**RecomiendoPymes** es un catálogo web de micro-emprendedores chilenos. Su propuesta de valor central es dar visibilidad en buscadores (Google) a emprendedores que venden por redes sociales (Instagram, Facebook, TikTok) y que no tienen dirección física ni sitio web propio. El sitio actúa como una **vitrina unificada** que centraliza sus redes de contacto y construye confianza a través de un sistema de reseñas autenticadas.

**No es** un e-commerce con carrito. **Sí es** una página de presentación indexable + directorio confiable.

---

## Actores del sistema

| Actor | Descripción |
|---|---|
| **Visitante** | Navega el catálogo sin cuenta. Puede ver perfiles pero no reseñar. |
| **Usuario registrado** | Cuenta con email verificado. Puede escribir reseñas a cualquier emprendimiento que no sea suyo. |
| **Usuario con emprendimiento** | Usuario que tiene uno o más emprendimientos asociados. Puede editarlos y responder reseñas. No tiene un rol especial — la relación se determina por `owner_user_id` en el emprendimiento. |
| **Admin** | Gestiona toda la plataforma. Creado por seed script, no hay registro público. |

---

## Arquitectura general

### Enfoque: Refactor por módulos (Opción B)

Reestructuración completa en módulos independientes con responsabilidades claras, tanto en backend como en frontend. Sin cambios de stack — se mantiene FastAPI + MongoDB + React + TailwindCSS.

### Backend

```
backend/
├── core/
│   ├── config.py          # Variables de entorno centralizadas (pydantic-settings)
│   ├── database.py        # Conexión MongoDB (motor async)
│   └── security.py        # JWT: generar, validar, refresh
├── modules/
│   ├── auth/
│   │   ├── models.py      # User, UserCreate, UserLogin, TokenResponse
│   │   ├── service.py     # Registro, login, verificación email, reset password
│   │   ├── router.py      # /api/auth/*
│   │   └── dependencies.py # get_current_user, require_admin, require_verified
│   ├── business/
│   │   ├── models.py      # Business, BusinessCreate, BusinessUpdate, estados
│   │   ├── service.py     # CRUD + slug generation + geocodificación
│   │   └── router.py      # /api/businesses/*
│   ├── review/
│   │   ├── models.py      # Review, ReviewCreate, ReviewResponse
│   │   ├── service.py     # CRUD reseñas + respuestas + moderación
│   │   └── router.py      # /api/businesses/:id/reviews/*
│   ├── media/
│   │   ├── service.py     # Cloudinary: generar URLs firmadas de upload
│   │   └── router.py      # /api/media/upload-url
│   ├── admin/
│   │   ├── service.py     # Métricas, gestión usuarios, moderación
│   │   └── router.py      # /api/admin/* (requiere role: admin)
│   └── meta/
│       ├── models.py      # Category, CityReference
│       ├── service.py     # CRUD categorías, listado ciudades
│       └── router.py      # /api/categories, /api/cities, /sitemap.xml
├── models.py              # Shared: PyObjectId, base config
└── server.py              # App factory — registra todos los routers
```

### Frontend

```
frontend/src/
├── features/
│   ├── catalog/           # Catálogo público
│   │   ├── HomePage.jsx
│   │   ├── BusinessCard.jsx
│   │   └── MapView.jsx
│   ├── business/          # Perfil público del emprendimiento
│   │   ├── BusinessDetail.jsx
│   │   ├── ReviewForm.jsx
│   │   └── ReviewItem.jsx       # Con sección de respuesta del emprendedor
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── entrepreneur/      # /mi-negocio/* — protegido (usuario con negocio)
│   │   ├── Dashboard.jsx        # Lista de negocios propios
│   │   ├── EditBusiness.jsx     # Editar info + imágenes + ubicación
│   │   └── MyReviews.jsx        # Ver reseñas y responder
│   └── admin/             # /admin/* — protegido (solo admin)
│       ├── AdminLayout.jsx
│       ├── DashboardPage.jsx
│       ├── BusinessesTable.jsx
│       ├── ReviewsTable.jsx
│       ├── CategoriesManager.jsx
│       └── UsersTable.jsx
├── components/
│   ├── ui/                # Shadcn/Radix (existente)
│   ├── ProtectedRoute.jsx # HOC de rutas protegidas por rol
│   └── AppLayout.jsx      # Layout público compartido
├── hooks/
│   ├── useAuth.js         # Context de autenticación global
│   ├── useWindowSize.js   # (existente)
│   └── use-toast.js       # (existente)
└── utils/
    ├── api.js             # Axios client + interceptores (existente, extendido)
    └── auth.js            # Gestión de tokens (localStorage + cookie)
```

---

## Modelos de datos

### Usuario
```python
{
  _id: ObjectId,
  email: str,               # único, requerido
  password_hash: str,
  role: "admin" | "user",   # solo 2 roles — entrepreneur NO es un rol
  name: str,
  is_active: bool,          # default: True
  is_email_verified: bool,  # reseñas requieren True
  created_at: datetime,
  updated_at: datetime
}
```

### Emprendimiento
```python
{
  _id: ObjectId,
  # — Identificación —
  name: str,                # NO editable por el emprendedor (afecta slug)
  slug: str,                # único, generado del nombre — para URLs SEO
  owner_user_id: ObjectId,  # usuario dueño (relación 1 usuario → N negocios)

  # — Contenido —
  category: str,
  description: str,
  social_links: SocialLinks,  # instagram, facebook, tiktok, whatsapp, website, etc.
  business_type: "online" | "physical" | "both",
  delivery_type: "local" | "nationwide" | "pickup_only" | "local_and_pickup",
  established: str,

  # — Imágenes (Cloudinary) —
  image: str,               # URL imagen principal
  gallery: [str],           # máx. 8 imágenes adicionales

  # — Ubicación —
  city: str,                # OBLIGATORIO — dropdown de ciudades de Chile
  location: str | None,     # dirección opcional
  coordinates: {
    lat: float,
    lng: float,
    is_exact: bool          # False = centro de ciudad. True = dirección ajustada
  },

  # — Estado y métricas —
  status: "pending" | "active" | "inactive",
  activated_at: datetime | None,  # timestamp cuando admin aprueba — base del badge "Nuevo"
  rating: float,            # calculado desde reseñas
  review_count: int,

  created_at: datetime,
  updated_at: datetime
}
```

### Reseña
```python
{
  _id: ObjectId,
  business_id: ObjectId,
  reviewer_user_id: ObjectId,   # requiere cuenta verificada
  reviewer_name: str,           # desnormalizado para display
  rating: int,                  # 1-5
  text: str,
  is_visible: bool,             # False = moderada por admin (no borrada)
  flagged: bool,                # True = detección automática de comportamiento sospechoso
  response: {                   # None si no hay respuesta
    text: str,
    date: datetime,
    responder_user_id: ObjectId
  } | None,
  date: datetime,
  created_at: datetime
}
```

### Categoría
```python
{
  _id: ObjectId,
  name: str,                    # único
  slug: str,                    # único
  icon: str | None,             # emoji o nombre de ícono Lucide
  created_at: datetime
}
```

### Configuración del sistema (nueva colección)
```python
{
  _id: ObjectId,
  key: str,                     # identificador único de la configuración
  value: Any,                   # valor configurable
  description: str,             # descripción para el admin
  updated_at: datetime
}
# Ejemplos de registros iniciales:
# { key: "suspicious_review_count", value: 5, description: "N reseñas iguales en ventana de tiempo" }
# { key: "suspicious_review_window_hours", value: 2, description: "Ventana en horas para detección" }
# { key: "new_business_boost_days", value: 30, description: "Días de impulso para nuevos emprendimientos" }
```

### Página legal
```python
{
  _id: ObjectId,
  key: "terms" | "privacy",    # identificador único
  content: str,                 # Markdown editable desde admin
  updated_at: datetime
}
```

---

## Autenticación y permisos

### Estrategia JWT (costo cero)
- **Access token**: JWT firmado con `HS256`, duración 60 minutos
- **Refresh token**: JWT firmado, duración 30 días, almacenado en cookie `httpOnly`
- Sin tabla de sesiones en DB — stateless puro
- Primer admin creado por seed script con credenciales en variables de entorno

### Flujos de registro

**Usuario estándar → cliente:**
```
POST /api/auth/register/client
email + contraseña + nombre
→ cuenta creada (is_email_verified: false)
→ email de verificación enviado (Resend)
→ puede navegar y ver perfiles
→ para reseñar: necesita verificar email
```

**Usuario con emprendimiento:**
```
Opción A — Self-service:
  Formulario inscripción → usa su cuenta (o crea una al mismo tiempo)
  → emprendimiento creado con status: "pending"
  → admin notificado
  → admin aprueba → status: "active"

Opción B — Admin lo crea directamente:
  Admin crea emprendimiento → ingresa email del dueño
  → sistema envía invitación
  → dueño crea su contraseña
  → negocio queda activo
```

**Admin:**
```
Solo vía seed script o creado por otro admin desde el panel
No hay registro público
Login en /admin/login
```

### Ciclo de vida del emprendimiento

```
[pending] ──(admin aprueba)──────────────────► [active]
    ▲                                              │
    │                                    (emprendedor desactiva
    │                                     o admin suspende)
    │                                              ▼
    └──(emprendedor solicita reactivación)──── [inactive]
                                       (admin aprueba re-ingreso)
```

### Matriz de permisos

| Acción | Visitante | Usuario | Usuario c/negocio | Admin |
|--------|-----------|---------|-------------------|-------|
| Ver catálogo y mapa | ✅ | ✅ | ✅ | ✅ |
| Ver perfil emprendimiento | ✅ | ✅ | ✅ | ✅ |
| Escribir reseña | ❌ | ✅* | ✅* (no propio) | ❌ |
| Responder reseña | ❌ | ❌ | ✅ (solo su negocio) | ✅ |
| Editar su negocio | ❌ | ❌ | ✅** | ✅ |
| Inscribir negocio | ❌ | ✅ | ✅ | ✅ |
| Desactivar su negocio | ❌ | ❌ | ✅ | ✅ |
| Panel admin completo | ❌ | ❌ | ❌ | ✅ |

*Requiere `is_email_verified: true`  
**Puede editar todo excepto el nombre del negocio (afecta slug SEO)

---

## Especificación de features

### 0. Ordenamiento del catálogo — emprendimientos sin rating

Problema: si se ordena solo por rating desc, los negocios nuevos (sin reseñas) siempre aparecen al fondo y nunca reciben su primera reseña.

**Lógica de ordenamiento:**

| Situación | Orden | Badge |  
|---|---|---|  
| Con reseñas | Por rating desc | — |  
| Sin reseñas, primeros 30 días desde activación | Mezclados al inicio del catálogo | 🆕 "Nuevo" |  
| Sin reseñas, más de 30 días | Al final, ordenados por fecha de creación | — |  

- El campo `activated_at: datetime` se guarda cuando el admin aprueba el negocio
- Los 30 días se calculan en tiempo real en la query de búsqueda
- Este período podrá hacerse configurable desde el panel admin en el futuro

---

### 1. Formulario de inscripción de emprendimiento (extendido)

Flujo multi-paso:

**Paso 1 — Datos básicos**
- Nombre del emprendimiento, categoría, descripción
- Tipo de negocio (online / presencial / mixto)
- Tipo de entrega

**Paso 2 — Contacto y redes**
- Ciudad: dropdown obligatorio con todas las ciudades de Chile
- Dirección: campo de texto opcional
- Links de redes sociales: Instagram, Facebook, TikTok, WhatsApp, website, etc.

**Paso 3 — Ubicación en mapa** *(visible para negocios físicos o mixtos)*
- Al seleccionar ciudad en Paso 2, el mapa se centra en esa ciudad automáticamente
- Si ingresa dirección: Nominatim la geocodifica y mueve el pin
- El emprendedor puede arrastrar el pin para ajustar la ubicación exacta
- Sin dirección: pin queda en el centro de la ciudad seleccionada (`is_exact: false`)

**Paso 4 — Imágenes**
- Upload de foto principal (obligatorio)
- Galería opcional (máx. 8 imágenes)
- Frontend solicita URL firmada al backend → sube directo a Cloudinary (sin pasar por el servidor)
- Cloudinary genera versiones optimizadas (WebP, resize automático)

**Paso 5 — Confirmación y T&C**
- Resumen del negocio a inscribir
- Checkbox de aceptación de Términos y Condiciones y Política de Privacidad (obligatorio)
- Submit → estado `pending` + notificación al admin

### 2. Vista de mapa (`/mapa`)

- Librería: **react-leaflet** + tiles **OpenStreetMap** (gratis, sin API key)
- Al cargar: geolocalización del browser del visitante para centrar el mapa
- Si rechaza o no está disponible: centra en Santiago
- Muestra solo negocios con `business_type: "physical" | "both"` y `status: "active"`
- Negocios online no aparecen en el mapa (sí en el catálogo de lista)
- Click en pin → popup con mini-card: foto, nombre, rating, categoría, link al perfil
- Filtro de categoría superpuesto al mapa

### 3. Dashboard del emprendedor (`/mi-negocio`)

- Lista de todos sus negocios con estado visual (badge de color)
- Por cada negocio:
  - Ver métricas básicas: rating actual, cantidad de reseñas
  - Editar información (excepto nombre)
  - Gestionar imágenes: reemplazar foto principal, añadir/quitar galería
  - Ver reseñas y responder (una respuesta por reseña, editable)
  - Botón "Desactivar" → cambia a `inactive`
  - Botón "Solicitar reactivación" (si está `inactive`) → cambia a `pending`
- Sección de perfil de usuario: nombre, email, contraseña

### 4. Panel de administración (`/admin/*`)

| Sección | Funcionalidad |
|---|---|
| **Dashboard** | Métricas: negocios por estado, reseñas del mes, nuevos usuarios, top categorías |
| **Emprendimientos** | Tabla filtrada por estado → aprobar, desactivar, editar, eliminar |
| **Reseñas** | Tabla → ocultar (`is_visible: false`) sin borrar (para auditoría) |
| **Categorías** | CRUD de categorías: nombre, slug, ícono |
| **Usuarios** | Tabla → activar/desactivar/promover a admin |
| **Páginas legales** | Editor Markdown de T&C y Política de Privacidad |

### 5. Reseñas autenticadas

- Requiere cuenta con email verificado
- Un usuario no puede reseñar su propio emprendimiento (validado por `owner_user_id`)
- Las reseñas se publican **de inmediato** — sin cola de moderación
- Emprendedor puede responder una vez por reseña (respuesta editable)
- Admin puede ocultar reseñas (`is_visible: false`) — no se muestran en el perfil público pero no se eliminan para auditoría

**Detección automática de sospechosos (sin rate limit fijo)**
- Si un usuario reseña N negocios distintos con el mismo rating en una ventana de X horas → `flagged: true` en la reseña
- N y X son configurables desde la sección *Configuración* del panel admin (no hardcodeados)
- Las reseñas flaggeadas aparecen destacadas en el panel admin para revisión manual
- Admin puede: ocultar la reseña y/o suspender el usuario (`is_active: false`)
- No hay rate limit diario por defecto — se puede activar y configurar si el comportamiento en producción lo justifica

**Feedback visual al usuario al reseñar**
- Confirmación inmediata: toast "¡Gracias por tu reseña!"
- Si no tiene email verificado e intenta reseñar: banner inline "Verifica tu email para dejar comentarios" con botón de reenvío

### 6. Imágenes con Cloudinary

- **Free tier**: 25GB storage, 25 créditos/mes — suficiente para MVP
- Flujo: frontend pide URL firmada al backend → sube directo a Cloudinary → guarda la URL pública en la DB
- El servidor nunca procesa binarios de imagen (menor uso de recursos)
- Transformaciones: resize automático a máx. 1200px ancho, conversión a WebP

### 7. SEO (central al valor del producto)

- URL slug único: `/emprendimiento/artesanias-maria-jose-temuco`
- Generado del nombre al crear el negocio, no se regenera si cambia el nombre
- `<title>`: `{nombre} — {categoría} en {ciudad} | RecomiendoPymes`
- `<meta name="description">`: primeros 160 caracteres de la descripción
- `<meta property="og:image">`: imagen principal del negocio
- JSON-LD `LocalBusiness` schema en cada perfil (indexable por Google)
- `GET /sitemap.xml` en el backend: lista todos los perfiles activos

### 7b. Feedback visual de estados (UX)

Estados que requieren comunicación clara al usuario:

| Momento | Canal | Mensaje |
|---|---|---|
| Negocio inscrito | Dashboard + email | "Tu emprendimiento está **pendiente de aprobación**. Te avisaremos cuando sea revisado." |
| Admin aprueba negocio | Email + dashboard | "¡Tu emprendimiento fue aprobado y ya aparece en el catálogo!" |
| Admin rechaza negocio | Email + dashboard | "Tu emprendimiento no fue aprobado. Motivo: [texto libre del admin]" |
| Admin desactiva negocio | Email + dashboard | "Tu emprendimiento ha sido desactivado. Contáctanos si tienes dudas." |
| Usuario con email no verificado | Banner inline | "Verifica tu email para poder dejar comentarios" + botón reenviar |
| Reseña enviada exitosamente | Toast | "¡Gracias por tu reseña! Ya está publicada." |
| Reseña respondida por emprendedor | Toast | "Tu respuesta fue publicada exitosamente." |
| Nuevo comentario recibido (emprendedor) | Badge en dashboard | Contador de reseñas sin respuesta |
| Negocio reactivado (vuelve a pending) | Dashboard | Estado visible como "Pendiente de reactivación" |

Todos los emails se envían via Resend (free tier). El panel admin muestra el estado actual de cada negocio con badges de color semántico (amarillo = pendiente, verde = activo, gris = inactivo).

---

### 8. Páginas legales

- **Términos y Condiciones** (existe, migrar a editable): incluye cláusula de desactivación de listado y responsabilidad del emprendedor por la veracidad de sus datos
- **Política de Privacidad** (nueva): requerida por **Ley 21.719** de datos personales de Chile. Cubre: qué datos se recopilan, para qué, por cuánto tiempo, cómo ejercer derechos ARCO
- Ambas editables desde el panel admin (Markdown → HTML renderizado)
- Checkbox de aceptación requerido en inscripción y registro

---

## Infraestructura (costo cero o free tier)

| Servicio | Uso | Plan | Costo |
|---|---|---|---|
| **MongoDB Atlas** | Base de datos | Free M0 (512MB) | $0 |
| **Cloudinary** | Almacenamiento de imágenes | Free (25GB) | $0 |
| **Resend** | Emails transaccionales | Free (3.000/mes) | $0 |
| **Leaflet.js + OpenStreetMap** | Mapa interactivo | Open source | $0 |
| **Nominatim/OSM** | Geocodificación | Free (con rate limit) | $0 |

---

## Monetización futura — arquitectura lista desde Fase 1

### Campos agregados al modelo Business (sin costo de implementación)

Todos con `default` — no requieren migración, no rompen nada existente:

```python
# — Monetización (Fase 2) —
featured: bool = False                  # Listado destacado
featured_until: datetime | None = None  # Expiración del destacado
is_verified: bool = False               # Badge de verificación de identidad
plan: "free" | "pro" = "free"           # Plan del emprendedor
plan_expires_at: datetime | None = None # Expiración del Plan Pro
view_count: int = 0                     # Contador de visitas al perfil
```

### Algoritmo de ordenamiento del catálogo (completo)

```
1° Destacados (featured: true, featured_until > now) → por rating desc
2° Sin reseñas + activados hace < N días (badge "🆕 Nuevo")
3° Con reseñas → por rating desc
4° Sin reseñas + activados hace > N días → por fecha desc
```

Donde N es configurable desde el panel admin (`new_business_boost_days`). Los destacados expirados vuelven al orden normal automáticamente.

### Ideas de monetización (ordenadas por complejidad)

1. **Listado destacado** — `featured: bool` + badge visual + posición prioritaria. Pago mensual. Menor complejidad — primer paso recomendado.
2. **Perfil verificado** — badge de identidad validada manualmente. Genera confianza. Puede ser gratuito (diferenciador de calidad) o pago.
3. **Plan Pro** — más imágenes en galería, estadísticas de visitas (`view_count`), WhatsApp button destacado (ya en `social_links`).
4. **Publicidad contextual** — banners en búsquedas de categorías. Alta complejidad. Fase 3+.

### Estrategia de UI para promoción (Fase 2, no implementar en Fase 1)

| Touchpoint | Audiencia | Efectividad | Implementación |
|---|---|---|---|
| **Dashboard emprendedor** | Emprendedor con negocio activo | 🔥 Alta | Banner + upsell en límite de imágenes |
| **Página `/planes`** | Emprendedores | Alta | Tabla Free vs Pro |
| **Header contextual** | Usuario logueado con negocio | Media | Badge `FREE` en avatar |
| **Footer** | Todos | Baja | Link en sección "Para emprendedores" |
| **Catálogo** | Emprendedores visitantes | Orgánica | Badge `✨ Destacado` en negocios Pro (publicidad viva) |

**Clave de conversión:** Los upsells funcionan mejor *en contexto* (cuando el usuario quiere algo que no puede hacer aún) que en páginas de marketing genéricas.

### Lo que se reserva ahora sin implementar
- Ruta `/planes` — registrada en el router como placeholder, sin contenido
- Slot de anuncio en el grid del catálogo — comentario `{/* Ad slot — Fase 2 */}` cada N tarjetas
- Módulo `modules/payments/` — carpeta vacía con README que documenta que aquí va Stripe

Cuando llegue la Fase 2, no hay refactor arquitectural — solo se implementa lo que ya tiene lugar reservado.

---

## Auditoría del código existente — Hallazgos

| Área | Estado | Observación |
|---|---|---|
| Backend API (CRUD, filtros, paginación) | ✅ Funciona | Sólida, bien estructurada — migrar a módulos conservando la lógica |
| Modelos Pydantic v2 | ✅ OK | PyObjectId ya resuelto |
| Frontend catálogo + filtros | ✅ Funciona | Migrar de componentes sueltos a feature-based |
| Formulario inscripción | ✅ Funciona | Extender con pasos de mapa + imágenes reales |
| Detalle emprendimiento | ✅ Funciona | Agregar respuestas a reseñas + JSON-LD |
| Autenticación | ❌ No existe | Feature completa pendiente |
| Panel admin | ❌ No existe | Feature completa pendiente |
| Mapa | ❌ No existe | Feature completa pendiente |
| Upload de imágenes | ❌ No existe | URLs son Unsplash hardcodeadas |
| SEO | ⚠️ Parcial | Falta slugs, meta dinámicos, JSON-LD, sitemap |
| Política de Privacidad | ❌ No existe | Requerida por ley chilena |
| Textos en inglés | ⚠️ Seed data en inglés | Migrar a español para Chile |
| Reseñas autenticadas | ❌ No existe | Requiere auth completa |
| Índices MongoDB | ✅ OK | Ya creados en startup |
| Manejo de errores | ✅ OK | Consistente, con logging |
| Variables de entorno | ✅ OK | `.env` con dotenv |
| CORS | ✅ OK | Configurado correctamente |

---

## Riesgos y mitigaciones

### R1 — Slug collisions
**Riesgo:** Dos negocios con el mismo nombre generan el mismo slug, causando conflicto de URLs.  
**Mitigación:** El generador de slugs verifica unicidad en DB al momento de crear. Si hay colisión, agrega sufijo numérico incremental: `artesanias-maria` → `artesanias-maria-2`.  
**Impacto en implementación:** Lógica en `business/service.py` al crear el slug.

---

### R2 — Imágenes huérfanas en Cloudinary
**Riesgo:** Un usuario sube imágenes durante el formulario pero abandona antes de enviar. Las imágenes quedan en Cloudinary consumiendo storage.  
**Mitigación:** Para MVP con free tier (25GB) es tolerable — el volumen inicial no lo justifica. Se documenta como deuda técnica a resolver si el catálogo crece.  
**Alternativa futura:** Upload solo al confirmar el formulario (submit final), o job de limpieza periódica de imágenes sin `business_id` asociado.

---

### R3 — Nominatim rate limiting
**Riesgo:** Nominatim impone máx. 1 req/segundo. Con varios usuarios geocodificando simultáneamente, las peticiones pueden fallar.  
**Mitigación:**
- Debounce de 600ms en el campo de dirección (no geocodifica con cada tecla)
- **Caché de coordenadas de ciudades principales de Chile** en la colección `Config` — si no hay dirección, las coordenadas del centro de ciudad se leen desde DB, no desde Nominatim
- La geocodificación por dirección exacta es opcional y de baja frecuencia

---

### R4 — Admin único (single point of failure)
**Riesgo:** Si el único admin no está disponible, los negocios quedan en `pending` indefinidamente y los emprendedores se frustran.  
**Mitigación:**
- Seed script crea **2 cuentas admin** por defecto (con distintas credenciales en `.env`)
- El dashboard admin muestra prominentemente el contador de pendientes
- El panel permite promover cualquier usuario a admin en cualquier momento

---

### R5 — Emails de verificación en spam
**Riesgo:** Los emails de Resend no llegan o van a spam, bloqueando la verificación de email y el flujo de reseñas.  
**Mitigación:**
- Configurar SPF y DKIM en el dominio al desplegar (Resend lo provee con pasos simples)
- Botón "Reenviar verificación" disponible siempre en el perfil de usuario (ya en spec)
- Texto de instrucción post-registro: "Revisa tu carpeta de spam si no ves el email"

---

### R6 — UI y contenido en inglés
**Riesgo:** El seed data, textos hardcodeados y componentes actuales están en inglés. El producto es para Chile — reduce confianza y credibilidad.  
**Mitigación:** El refactor incluye como tarea explícita: migrar todos los textos visibles al español, reemplazar el seed data con negocios ficticios chilenos, y validar que no queden strings en inglés en la UI pública.  
**Alcance:** Frontend completo + seed_data.py + mensajes de error de la API.

---

### R7 — Inscripciones spam por el mismo usuario
**Riesgo:** Un actor malicioso crea una cuenta, verifica el email e inscribe decenas de negocios falsos para saturar la cola de aprobación del admin.  
**Mitigación:**
- Email verificado es barrera inicial
- El admin ve las inscripciones agrupadas por usuario — patrón de spam es evidente
- Si se detecta, se inactiva el usuario (cascada sobre sus negocios y reseñas)
- Futura mejora: límite configurable de negocios pendientes por usuario desde panel admin

---

### R8 — Inactivación de usuario en cascada
**Comportamiento definido:** Cuando un admin inactiva un usuario (`is_active: false`):
1. El usuario no puede hacer login inmediatamente
2. Todas sus reseñas se marcan `is_visible: false` automáticamente (ocultamiento en cascada)
3. Sus negocios pasan a `inactive` automáticamente
4. Las reseñas y negocios **no se eliminan** — quedan en DB para auditoría
5. Si el admin reactiva al usuario, los negocios y reseñas **no** se reactivan automáticamente — el admin los revisa y decide caso a caso

---

## Próximo paso

Invocar el skill `writing-plans` para crear el plan de implementación detallado basado en este diseño.
