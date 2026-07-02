# Spec — Autenticación y Usuarios

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-4) · Anclado al código a 2026-06-20 (rama `main`)
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
- **US-7** — Como usuario, quiero editar mi perfil: nombre, contraseña (con la actual) y email (re-verificando el nuevo).
- **US-8** — Como admin, quiero que ciertas rutas estén restringidas solo a administradores.

## Reglas de negocio

- **RN-1** — Roles: `admin` y `user`. _(Reconciliación C2: se evalúa un tercer rol **`moderador`** con permisos acotados — ver Admin AD-13; de adoptarse, este RN se amplía a 3 roles.)_ "Dueño de negocio" no es un rol.
- **RN-2** — El registro público siempre crea `role: "user"`, `is_active: true`, `is_email_verified: false`, sin importar lo que envíe el cliente.
- **RN-3** — La contraseña debe tener mínimo 8 caracteres; el nombre entre 2 y 100; el email con formato válido.
- **RN-4** — No se puede registrar dos veces el mismo email.
- **RN-5** — Access token JWT de 60 min; refresh token de 30 días en cookie `httpOnly` (`Secure` en producción, `SameSite=Lax`).
- **RN-6** — El token de verificación expira en 24 h; el de reset en 15 min.
- **RN-7** — `forgot-password` responde igual exista o no el email (no revela si está registrado).
- **RN-8** — Un usuario con `is_active: false` no puede iniciar sesión ni operar en rutas protegidas.
- **RN-9** — Rate limiting: registro 5/min por IP; recuperación de contraseña 3/min por IP.
- **RN-10** — El envío de emails es *best-effort*: si el proveedor falla, la operación no se rompe.
- **RN-11** — Requieren email verificado: escribir reseña, **inscribir negocio**, **editar negocio** y **responder reseña**. Navegar el catálogo y editar el perfil no lo requieren. _(decidido 2026-06-20; ver Backlog)_
- **RN-12** — El cambio de email exige re-verificación: al cambiarlo, la cuenta queda `is_email_verified: false` hasta confirmar el nuevo. El cambio de contraseña requiere la contraseña actual. _(decidido 2026-06-20)_
- **RN-13** — `POST /refresh` debe rechazar a usuarios `is_active: false`. _(decidido 2026-06-20)_
- **RN-14** — El login debe tener rate limiting (por IP, y evaluar por cuenta) para mitigar fuerza bruta / credential stuffing. _(decidido 2026-06-20)_
- **RN-15** — El registro debe guardar el consentimiento de **T&C y Privacidad** (fecha + versión aceptada). Sin aceptación, el registro es inválido. _(legal, Ley 21.719)_
- **RN-16** — El usuario tiene derecho a **eliminar su cuenta y datos personales** (ARCO, Ley 21.719); definir cascada vs. anonimización de negocios/reseñas asociados. _(legal)_
- **RN-17** — El registro debe responder **sin revelar** si un email ya existe (uniforme, consistente con RN-7). _(corrige inconsistencia de enumeración)_
- **RN-18** — Debe existir revocación de sesión (p. ej. versión de token) para invalidar refresh tokens en logout, cambio de contraseña y desactivación.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado un email no registrado, cuando me registro con datos válidos, entonces se crea la cuenta (`is_email_verified: false`), recibo un access token y se envía el email de verificación.
- **CA-2** — Dado un email ya registrado, cuando intento registrarme, entonces recibo error 400 "Este email ya está registrado". _(comportamiento actual; RN-17 lo cambiará a respuesta uniforme — ver CA-28)_
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
- **CA-20** — Dado un usuario sin email verificado, cuando intenta inscribir negocio, editar negocio o responder reseña, entonces recibe 403 "Debes verificar tu email…".
- **CA-21** — Dado que estoy autenticado y conozco mi contraseña actual, cuando la cambio por una nueva (≥8), entonces se actualiza y puedo iniciar sesión con ella.
- **CA-22** — Dada una contraseña actual incorrecta, cuando intento cambiar la contraseña, entonces recibo error y no se actualiza.
- **CA-23** — Dado que cambio mi email, cuando guardo, entonces la cuenta queda `is_email_verified: false` y se envía verificación al nuevo email.
- **CA-24** — Dado un usuario `is_active: false` con cookie de refresh válida, cuando llama a `/refresh`, entonces recibe 401/403 y no obtiene un nuevo access token.
- **CA-25** — Dado que supero el límite de intentos de login, cuando insisto, entonces recibo 429.
- **CA-26** — Dado que me registro sin aceptar T&C/Privacidad, cuando envío, entonces se rechaza; al aceptar, se guarda el consentimiento con fecha y versión.
- **CA-27** — Dado que solicito eliminar mi cuenta, cuando se confirma, entonces mis datos personales se eliminan/anonimizan según la política definida.
- **CA-28** — Dado un email ya registrado, cuando intento registrarme (post RN-17), entonces la respuesta no permite distinguir que el email existe.
- **CA-29** — Dado que cierro sesión o cambio mi contraseña, cuando ocurre, entonces los refresh tokens previos quedan invalidados.

## Roadmap (futuro / Fase 2)

- **R-1 — Login social (Google).** Registro/login con Google. Interés confirmado (2026-06-20); se construye en Fase 2. **Decisión clave a definir:** account-linking cuando el email ya existe con contraseña (¿vincular cuentas o mantenerlas separadas?). Como Google entrega el email ya verificado, esos usuarios podrían saltarse el paso de verificación. Implica que el modelo deje de asumir `password_hash` siempre presente.

## Fuera de alcance (de este módulo)

- Autenticación de dos factores (2FA).
- Permisos granulares más allá de `admin`/`user`.

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Registro | ✅ | `POST /api/auth/register`, fuerza `role:user`. |
| US-2 Verificación email | ✅ | `GET /api/auth/verify-email`. Depende de Resend configurado en prod. |
| US-3 Reenviar verificación | ✅ | `POST /api/auth/resend-verification` (requiere login). |
| US-4 Login / Logout | ✅ | `POST /login`, `/logout`. |
| US-5 Refresh de sesión | 🟡 | `POST /refresh` funciona; falta revalidar `is_active` (RN-13, B-3). |
| US-6 Recuperar contraseña | ✅ | `forgot-password` + `reset-password`. |
| US-7 Editar perfil | 🟡 | Solo **nombre** (`PUT /me`). Falta contraseña y email con re-verificación (B-1). |
| US-8 Restricción admin | ✅ | `require_admin` en dependencias. |
| RN-11 Verificación en acciones | ✅ | `require_verified` aplicado a reseñar, inscribir, editar y responder (sprint P0). Falta UX 403 en el front. |
| RN-14 Login rate limiting | ✅ | `/login` a 10/min por IP (B-5; pendiente de merge a `main`). |
| RN-15 Consentimiento T&C | ✅ | Checkbox obligatorio + `accepted_terms`/`terms_accepted_at`/`terms_version` (B-6; texto aún borrador, pendiente de merge). |
| RN-16 Borrado de cuenta (ARCO) | ❌ | No existe; legal (B-7). |
| RN-17/18 Enumeración + revocación | ❌ | Registro filtra existencia; logout no revoca (B-8). |
| UI recuperación de contraseña | 🟡 | Funciona pero estilo plano, no homologado a LoginPage (B-9). |
| RN-2 Forzar rol user | ✅ | El servicio ignora `role` del input. |
| RN-5 Cookies/JWT | ✅ | `COOKIE_SECURE` por `ENVIRONMENT`. |
| RN-7 Respuesta uniforme | ✅ | `forgot_password` no revela existencia. |
| RN-9 Rate limiting | ✅ | slowapi en register/forgot-password. |
| RN-10 Email best-effort | ✅ | try/except + logging. |

## Decisiones tomadas (2026-06-20)

- **D-1** — Sí se implementa cambio de **contraseña** (con la actual) y de **email** (con re-verificación) en el perfil. → RN-12, US-7, B-1.
- **D-2** — La verificación de email se exige también para **inscribir, editar y responder** (además de reseñar). → RN-11, B-2.
- **D-3** — Se cierra la brecha de `/refresh`: debe rechazar usuarios desactivados. → RN-13, B-3.
- **D-4** — Se acepta la higiene del modelo de registro (no aceptar `role`/`is_active`/`is_email_verified` en el input). → B-4.
- **D-5** — Se agregan al backlog: rate limiting de login (B-5), consentimiento T&C (B-6), borrado ARCO (B-7), respuesta uniforme + revocación (B-8). → RN-14..18.
- **D-6** — **Login social (Google):** al roadmap de Fase 2, con la decisión de account-linking pendiente. → R-1.
- **D-7** — Homologar el diseño de las pantallas de recuperación queda **especificado** (B-9), sin implementar ahora.

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **B-1** | Endpoint(s) de cambio de contraseña (usa `ChangePasswordRequest`) y de email con re-verificación; UI en perfil | Medio | Validar contraseña actual; al cambiar email → `is_email_verified:false` + enviar verificación |
| **B-2** | Aplicar `require_verified` a inscribir/editar negocio y responder reseña | Bajo | La dependencia ya existe; falta usarla en los routers de `business` y `review` (se reflejará en sus specs) |
| ~~**B-3**~~ | ✅ `/refresh` revalida `is_active` | Bajo | Hecho: lee el usuario y rechaza 401/403 si no existe o `is_active:false` |
| ~~**B-4**~~ | ✅ Separar modelo de entrada de registro (no heredar `role`/`is_active`/`is_email_verified`) | Bajo | **Hecho (2026-07-02).** `UserCreate` solo expone email/name/password/accepted_terms |
| ~~**B-5**~~ | ✅ Rate limiting en login | Bajo | Hecho: `/login` 10/min por IP (rama `fix/auth-login-ratelimit`, pendiente merge) |
| ~~**B-6**~~ | ✅ Registrar consentimiento T&C/Privacidad al registrarse | Bajo | Hecho: checkbox + `accepted_terms`/`terms_accepted_at`/`terms_version` (pendiente merge) |
| **B-7** | Borrado de cuenta (derecho ARCO) | Medio-Alto | Cascada (reconciliación C6): reseñas se **anonimizan** (RV-7), negocios se **archivan/anonimizan** (Negocios RN-16); legal |
| **B-8** | Respuesta uniforme en registro (RN-17) + revocación de tokens (RN-18) | Medio | logout/cambio de contraseña invalidan sesiones |
| **B-9** | Homologar UI de ForgotPassword/ResetPassword al estilo de LoginPage | Bajo | Tokens + logo "Recomiendo/Pymes"; destino ya existe |
