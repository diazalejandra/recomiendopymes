# Spec — Autenticación y Usuarios

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
> Módulo backend: `modules/auth/` · Frontend: `features/auth/`

## Propósito

Permitir que las personas creen una cuenta, inicien sesión y gestionen su acceso, con
verificación de email y recuperación de contraseña. La autenticación habilita acciones
de confianza (reseñas) y el acceso a paneles (emprendedor, admin).

## Actores

| Actor | Cómo se obtiene |
|---|---|
| Visitante | Sin cuenta. No autenticado. |
| Usuario | Cuenta creada (`role: "user"`). Puede tener email verificado o no. |
| Dueño de negocio | Es un Usuario que posee ≥1 negocio (por `owner_user_id`). **No es un rol.** |
| Admin | `role: "admin"`. Solo por seed script o promoción desde el panel admin. Sin registro público. |

## Historias de usuario

- **US-1** — Como visitante, quiero registrarme con email, nombre y contraseña para tener una cuenta.
- **US-2** — Como usuario, quiero verificar mi email mediante un enlace para habilitar acciones de confianza.
- **US-3** — Como usuario, quiero reenviar el email de verificación si no me llegó.
- **US-4** — Como usuario, quiero iniciar y cerrar sesión.
- **US-5** — Como usuario, quiero que mi sesión se mantenga (refresh automático) sin re-loguearme cada hora.
- **US-6** — Como usuario, quiero recuperar mi contraseña si la olvidé (enlace por email).
- **US-7** — Como usuario, quiero editar mi perfil.
- **US-8** — Como admin, quiero que ciertas rutas estén restringidas solo a administradores.

## Reglas de negocio

- **RN-1** — Solo existen dos roles: `admin` y `user`. "Dueño de negocio" no es un rol.
- **RN-2** — El registro público siempre crea `role: "user"`, `is_active: true`, `is_email_verified: false`, sin importar lo que envíe el cliente.
- **RN-3** — La contraseña debe tener mínimo 8 caracteres; el nombre entre 2 y 100; el email con formato válido.
- **RN-4** — No se puede registrar dos veces el mismo email.
- **RN-5** — Access token JWT de 60 min; refresh token de 30 días en cookie `httpOnly` (`Secure` en producción, `SameSite=Lax`).
- **RN-6** — El token de verificación expira en 24 h; el de reset en 15 min.
- **RN-7** — `forgot-password` responde igual exista o no el email (no revela si está registrado).
- **RN-8** — Un usuario con `is_active: false` no puede iniciar sesión ni operar en rutas protegidas.
- **RN-9** — Rate limiting: registro 5/min por IP; recuperación de contraseña 3/min por IP.
- **RN-10** — El envío de emails es *best-effort*: si el proveedor falla, la operación no se rompe.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado un email no registrado, cuando me registro con datos válidos, entonces se crea la cuenta (`is_email_verified: false`), recibo un access token y se envía el email de verificación.
- **CA-2** — Dado un email ya registrado, cuando intento registrarme, entonces recibo error 400 "Este email ya está registrado".
- **CA-3** — Dada una contraseña < 8 caracteres o email inválido, cuando me registro, entonces recibo error de validación (422) y no se crea la cuenta.
- **CA-4** — Dado que envío `role: "admin"` en el registro, cuando se crea la cuenta, entonces queda como `user` (nunca admin).
- **CA-5** — Dado el enlace de verificación válido, cuando lo abro, entonces mi cuenta queda `is_email_verified: true`.
- **CA-6** — Dado un token de verificación expirado/ inválido, cuando lo uso, entonces recibo un mensaje claro de enlace expirado/ inválido.
- **CA-7** — Dado un usuario verificado, cuando reenvío verificación, entonces recibo "Email ya verificado" (no se reenvía).
- **CA-8** — Dadas credenciales correctas, cuando inicio sesión, entonces recibo access token + cookie de refresh.
- **CA-9** — Dadas credenciales incorrectas, cuando inicio sesión, entonces recibo 401 sin distinguir si el email existe.
- **CA-10** — Dado un usuario `is_active: false`, cuando inicia sesión, entonces recibe 403 "Cuenta desactivada".
- **CA-11** — Dado un access token expirado y una cookie de refresh válida, cuando una petición devuelve 401, entonces el cliente refresca el token automáticamente y reintenta sin desloguear.
- **CA-12** — Dado que cierro sesión, cuando hago logout, entonces se elimina la cookie de refresh.
- **CA-13** — Dado un email registrado, cuando pido recuperar contraseña, entonces recibo el email con enlace y un mensaje uniforme.
- **CA-14** — Dado un email NO registrado, cuando pido recuperar contraseña, entonces recibo el **mismo** mensaje uniforme (sin filtrar existencia).
- **CA-15** — Dado un token de reset válido, cuando ingreso una contraseña nueva (≥8), entonces se actualiza y puedo iniciar sesión con ella.
- **CA-16** — Dado un token de reset expirado, cuando lo uso, entonces recibo "El enlace ha expirado. Solicita uno nuevo."
- **CA-17** — Dado que supero el rate limit (5 registros/min o 3 reset/min), cuando insisto, entonces recibo 429.
- **CA-18** — Dado que estoy autenticado, cuando consulto `/me`, entonces recibo mis datos sin `password_hash`.
- **CA-19** — Dado un usuario no admin, cuando accede a una ruta `require_admin`, entonces recibe 403.

## Fuera de alcance (de este módulo)

- Login social (Google, etc.).
- Autenticación de dos factores (2FA).
- Permisos granulares más allá de `admin`/`user`.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Registro | ✅ | `POST /api/auth/register`, fuerza `role:user`. |
| US-2 Verificación email | ✅ | `GET /api/auth/verify-email`. Depende de Resend configurado en prod. |
| US-3 Reenviar verificación | ✅ | `POST /api/auth/resend-verification` (requiere login). |
| US-4 Login / Logout | ✅ | `POST /login`, `/logout`. |
| US-5 Refresh de sesión | 🟡 | `POST /refresh` funciona, pero **no revalida `is_active`** (ver H-3). |
| US-6 Recuperar contraseña | ✅ | `forgot-password` + `reset-password`. |
| US-7 Editar perfil | 🟡 | Solo **nombre** (`PUT /me`). Falta email y contraseña (ver H-1). |
| US-8 Restricción admin | ✅ | `require_admin` en dependencias. |
| RN-2 Forzar rol user | ✅ | El servicio ignora `role` del input. |
| RN-5 Cookies/JWT | ✅ | `COOKIE_SECURE` por `ENVIRONMENT`. |
| RN-7 Respuesta uniforme | ✅ | `forgot_password` no revela existencia. |
| RN-9 Rate limiting | ✅ | slowapi en register/forgot-password. |
| RN-10 Email best-effort | ✅ | try/except + logging. |

## Hallazgos / decisiones pendientes

- **H-1 (gap)** — No existe cambio de **contraseña** ni de **email** estando logueado. `ChangePasswordRequest` está definido pero sin endpoint; `UserUpdate` solo permite `name`. ¿Se implementa cambio de contraseña/email en perfil? *(decisión)*
- **H-2 (higiene)** — `UserCreate` hereda `role`/`is_active`/`is_email_verified` de `UserBase`; el servicio los ignora (no explotable) pero el modelo de entrada no debería aceptarlos. Recomendado: separar el modelo de entrada.
- **H-3 (menor)** — `POST /refresh` no revalida `is_active`; un usuario desactivado con cookie válida puede emitir access tokens nuevos (las rutas protegidas igual lo bloquean al revalidar). ¿Se cierra esta brecha?
- **H-4 (decisión de diseño)** — El login **no** exige email verificado; se puede navegar sin verificar y solo acciones puntuales (reseñas) lo requieren. Confirmar que es el comportamiento deseado.
