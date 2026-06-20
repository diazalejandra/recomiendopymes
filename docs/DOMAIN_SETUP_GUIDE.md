# Guía de configuración del dominio `recomiendopymes.cl`

Runbook para migrar de los dominios temporales (`recomiendopymes.vercel.app` +
`recomiendopymes-api.onrender.com`) al dominio propio `recomiendopymes.cl`.

## Arquitectura objetivo

| Pieza | Dominio objetivo | Plataforma |
|---|---|---|
| Frontend (web) | `recomiendopymes.cl` (+ `www`) | Vercel |
| Backend (API) | `api.recomiendopymes.cl` | Render |
| Emails | `noreply@recomiendopymes.cl` | Resend |

**Por qué el backend en subdominio del `.cl` y no en `onrender.com`:** el frontend
manda la cookie de sesión (`refresh_token`, `httpOnly`, `SameSite=Lax`) al backend.
Si frontend y backend comparten el dominio raíz `recomiendopymes.cl`, son *same-site*
y la cookie viaja correctamente. Con `onrender.com` son *cross-site* y `SameSite=Lax`
no la envía → el refresh de sesión queda frágil.

> **Dónde administrar el DNS:** los registros de abajo son los mismos sin importar el
> panel. Si compraste el `.cl` directo en NIC Chile, usa su editor de zona; si fue por
> un reseller, su panel de DNS. Cloudflare (gratis) es más cómodo a largo plazo pero
> requiere cambiar los nameservers en NIC Chile — opcional, no necesario para esto.

---

## Orden recomendado

Primero el DNS y los dominios custom (el SSL tarda en provisionarse), y **al final**
se cambian las variables de entorno para apuntar todo al `.cl`.

### Fase 1 — Frontend en Vercel
1. Vercel → Proyecto → **Settings → Domains** → agrega `recomiendopymes.cl` y `www.recomiendopymes.cl`.
2. Vercel te mostrará los registros DNS exactos. Típicamente:
   - Apex `recomiendopymes.cl`: registro **A** → la IP que indique Vercel (ej. `76.76.21.21`).
   - `www`: registro **CNAME** → `cname.vercel-dns.com`.
3. Agrégalos en tu panel DNS y espera a que Vercel marque el dominio como *Valid* (SSL listo).
4. Configura `www` para que redirija al apex (Vercel lo ofrece automáticamente).

### Fase 2 — Backend (API) en Render
1. Render → tu servicio → **Settings → Custom Domains** → agrega `api.recomiendopymes.cl`.
2. Render te dará un target. Agrega en DNS: **CNAME** `api` → el target que indique Render
   (ej. `recomiendopymes-api.onrender.com`).
3. Espera a que Render marque el dominio como verificado y emita el certificado.

### Fase 3 — Emails en Resend
1. Resend → **Domains** → agrega `recomiendopymes.cl`.
2. Agrega en DNS los registros que muestre Resend: **SPF** (`TXT`), **DKIM** y **DMARC**.
3. Espera a que Resend marque el dominio como **Verified**.

### Fase 4 — Reapuntar las apps (variables de entorno)
Recién cuando los tres dominios resuelvan con SSL:

**Vercel (frontend):**
- `VITE_API_URL` = `https://api.recomiendopymes.cl/api`  ← debe incluir `/api`
- Redeploy.

**Render (backend):**
- `FRONTEND_URL` = `https://recomiendopymes.cl`
- `CORS_ORIGINS` = `https://recomiendopymes.cl,https://www.recomiendopymes.cl,https://recomiendopymes.vercel.app`
  _(deja `.vercel.app` durante la transición; quítalo cuando ya no lo uses)_
- `ENVIRONMENT` = `production`  ← activa cookies `Secure` y oculta `/docs`
- `RESEND_API_KEY` = la key de producción de Resend
- `FROM_EMAIL` = `noreply@recomiendopymes.cl`
- Redeploy.

### Fase 5 — Verificación
1. Abre `https://recomiendopymes.cl` — el catálogo carga, candado SSL OK.
2. Registra una cuenta con email real → llega el correo de verificación.
3. Inicia sesión, espera o fuerza expiración del token → la sesión se refresca sin desloguear.
4. "Recuperar contraseña" funciona sin error de CORS.
5. F12 → Console/Network sin errores rojos.

---

## Notas

- **No hay cambios de código** en esta migración: la URL del API la define `VITE_API_URL`
  (Vercel) y el resto son variables de entorno. La cookie `SameSite=Lax` funciona porque
  `recomiendopymes.cl` y `api.recomiendopymes.cl` son same-site.
- Los `.cl` usan NIC Chile como registro. La propagación DNS puede tardar de minutos a
  varias horas.
- Mantén `recomiendopymes.vercel.app` operativo hasta confirmar que el `.cl` funciona
  end-to-end; recién entonces comunica el cambio de URL.
