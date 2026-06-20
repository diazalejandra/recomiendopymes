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

## 3. Despliegue Frontend (SPA Routing)

- Dado que usamos React (Vite) como Single Page Application (SPA), el proveedor de hosting (Vercel) debe estar configurado para redirigir todo el tráfico entrante a `index.html`. Esto previene errores 404 al navegar directamente a enlaces como `/noticias` o al actualizar la página. En Vercel, esto se logra manteniendo el archivo `vercel.json` con la regla de `rewrites`.

## 4. Próxima Migración a PNPM
- Existe la intención de migrar la gestión de dependencias de `npm` a `pnpm` para mejorar la seguridad y velocidad. Cuando ocurra, el comando de instalación en los pipelines CI/CD (Render/Vercel) se actualizará automáticamente siempre y cuando se suba el archivo `pnpm-lock.yaml`.
