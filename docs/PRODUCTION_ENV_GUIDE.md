# Guía de Entorno y Producción

Este documento detalla las consideraciones críticas que deben tenerse en cuenta al configurar las variables de entorno (`.env`) en la infraestructura de producción (Render, Vercel, etc.) y las políticas de desarrollo local.

## 1. Envío de Emails (Resend)

### Desarrollo Local
- **`RESEND_API_KEY`**: Se recomienda **dejarla vacía**. Al no tener la API Key configurada, el backend pasará automáticamente a un modo de simulación o "Skip Silencioso". En lugar de enviar un email real, imprimirá el enlace de activación o recuperación directamente en la consola (terminal) del servidor FastAPI. Esto permite crear cuentas de prueba rápidamente.

### Producción (Render)
- **`RESEND_API_KEY`**: Debe contener la Key de producción válida.
- **`FROM_EMAIL`**: Debe ser `noreply@recomiendopymes.cl`. 
  > [!IMPORTANT]
  > Para que Resend permita enviar correos desde este dominio, el dominio `recomiendopymes.cl` **debe estar verificado** en el dashboard de Resend. Esto requiere configurar registros DNS (TXT y MX) en el proveedor del dominio. Sin esta verificación, los correos rebotarán.

## 2. Enrutamiento del Frontend

### Desarrollo Local
- **`FRONTEND_URL`**: Debe apuntar al puerto donde Vite está corriendo localmente (usualmente `http://localhost:3001` con el script de arranque `start.ps1`, o `http://localhost:3000`).

### Producción (Render / Vercel)
- **`FRONTEND_URL`**: **Obligatoriamente** debe apuntar al dominio público oficial (ej. `https://recomiendopymes.cl` o la URL de Vercel). 
  > [!WARNING]
  > Si se despliega a producción con el valor `http://localhost:3000`, todos los emails enviados a usuarios reales contendrán botones y enlaces apuntando a `localhost`, lo cual romperá por completo los flujos de activación de cuenta y recuperación de contraseñas.

## 3. Despliegue Frontend (Next.js — App Router)

> **Actualizado en el cutover (ADR-0001).** El frontend de producción es **Next.js**
> (`web/`). El Vite (`frontend/`) queda como **fallback temporal** hasta confirmar
> estabilidad. Ya **no** se usa el `vercel.json` con rewrite a `index.html`: Next maneja
> el ruteo (SSR/SSG/ISR) nativamente, sin 404 en subrutas.

### Proyecto de Vercel
- **Root Directory:** `web` (antes `frontend`).
- **Framework Preset:** Next.js (autodetección).
- **Build/Output:** por defecto de Next (no fijar `vercel.json` de SPA).

### Variables de entorno del proyecto web (Vercel)
| Variable | Valor prod | Para qué |
|---|---|---|
| `API_PROXY_TARGET` | `https://api.recomiendopymes.cl` | **Server-only.** Destino del proxy de Next para `/api/*` (cliente → mismo origen → la cookie de refresh funciona). Se **hornea en build**, así que un cambio exige redeploy. |
| `API_INTERNAL_URL` | `https://api.recomiendopymes.cl/api` | **Server-only.** Base del fetch server-side de páginas públicas (SSR/ISR). No lleva prefijo `NEXT_PUBLIC_` a propósito: no debe filtrarse al bundle del cliente. |
| `NEXT_PUBLIC_SITE_URL` | `https://recomiendopymes.cl` | URL pública para `sitemap.xml`, `robots.txt` y `canonical`. |

> [!IMPORTANT]
> **No** setear `NEXT_PUBLIC_API_URL` en el proyecto web: el cliente debe usar `/api`
> relativo (proxy same-origin). Una URL absoluta ahí sería cross-site y rompería la
> cookie de refresh (requeriría el rework de auth, hoy diferido).

- **Backend (Render):** `FRONTEND_URL=https://recomiendopymes.cl` se mantiene igual (el
  dominio del front no cambia en el cutover), así que los emails de Resend siguen bien.

### Runbook del cutover (corte in-place)
1. En el proyecto Vercel actual, agregar las 3 env vars de arriba (a Production).
2. Cambiar **Root Directory** `frontend` → `web` y confirmar Framework = Next.js.
3. Redeploy. Validar en `https://recomiendopymes.cl` (desde red no corporativa).
4. Smoke test: home/catálogo, ficha (+ view-source: meta OG/JSON-LD), noticias, login
   (cookie de refresh), `/mapa`, `/sitemap.xml`, `/robots.txt`, favicon.
5. Si algo falla → **rollback:** revertir Root Directory a `frontend` y redeploy (el Vite
   sigue intacto como fallback).
6. Confirmada la estabilidad unos días → retirar `frontend/` y su job de CI.

## 4. Próxima Migración a PNPM
- Existe la intención de migrar la gestión de dependencias de `npm` a `pnpm` para mejorar la seguridad y velocidad. Cuando ocurra, el comando de instalación en los pipelines CI/CD (Render/Vercel) se actualizará automáticamente siempre y cuando se suba el archivo `pnpm-lock.yaml`.
