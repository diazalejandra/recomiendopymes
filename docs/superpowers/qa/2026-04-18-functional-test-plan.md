# Plan Maestro de Pruebas Funcionales — Fase 1

Usa este documento como bitácora de QA. Prueba la aplicación en producción como si fueras tres personas distintas. **Antes de empezar**, confirma que tienes estas URLs a mano:

- **Frontend (Vercel):** https://recomiendopymes.cl (o tu subdominio `.vercel.app`)
- **Backend (Render):** Entra al dashboard de Render y copia la URL de tu servicio
- **MongoDB Atlas:** Solo para verificar datos si algo falla

> ⚠️ **Advertencia Render (plan gratuito):** El backend se duerme tras 15 minutos de inactividad. La primera request puede tardar 30–60 segundos. Si el catálogo no carga al inicio, espera y recarga una vez más. Si sigue fallando después de 90 segundos, el backend está caído — entra a Render y revisa los logs.

---

## Preparación de sesiones

Abre **tres ventanas separadas** para no mezclar sesiones:
- 🔵 **Chrome Incógnito** → Cliente/Visitante
- 🟢 **Chrome normal** → Emprendedor (cuenta nueva)
- 🟠 **Edge o Firefox** → Administrador (tu cuenta admin)

Necesitarás **dos cuentas de email reales** que puedas revisar durante las pruebas.

---

## 🎭 Escenario 1: El Cliente (Visitante)

| ID | Test | Pasos a seguir | Resultado Esperado | Pasó? |
|---|---|---|---|---|
| C1 | **Cold start / Primera carga** | Entra al sitio desde Chrome incógnito con F12 → Network abierto. Mide el tiempo hasta que aparecen las tarjetas. | El catálogo carga. Si demora más de 30s, es el cold start de Render — espera y recarga. Si falla 2 veces seguidas, anótalo como bug. | [ ] |
| C2 | **Catálogo sin login** | Navega por las tarjetas sin loguearte. Revisa la consola (F12) mientras navegas. | Las tarjetas muestran imagen, nombre, categoría y ciudad. Sin errores rojos en consola. | [ ] |
| C3 | **Filtro por categoría** | Usa el dropdown de categoría. Luego limpia el filtro. | Las tarjetas se filtran correctamente. Limpiar el filtro restaura todos los resultados. | [ ] |
| C4 | **Buscador** | Escribe el nombre de un negocio del seed en el buscador y presiona Enter. | Aparece el negocio buscado. Una búsqueda sin resultados muestra un mensaje vacío, no error. | [ ] |
| C5 | **Toggle "envíos nacionales"** | Activa el switch de envíos nacionales (si está visible en la vista). | Aparecen negocios con `delivery_scope: nationwide` que antes no estaban. | [ ] |
| C6 | **Mapa interactivo** | Ve a la vista de mapa. | Solo aparecen pines de negocios físicos o mixtos. Los negocios 100% digitales **no tienen pin**. | [ ] |
| C7 | **Detalle de negocio** | Haz click en cualquier tarjeta del catálogo. | Se carga la página de detalle. El **título de la pestaña del navegador** cambia al nombre del negocio. | [ ] |
| C8 | **Botón WhatsApp** | En el detalle de un negocio que tenga WhatsApp, haz click en el botón. | Abre WhatsApp Web o la app con un mensaje prellenado que menciona "RecomiendoPymes" y el nombre del negocio. | [ ] |
| C9 | **Registro con email real** | Click en Registrarse. Usa un email real que puedas revisar ahora. | Ves un mensaje de "revisa tu email". El email de verificación llega en menos de 2 minutos. | [ ] |
| C10 | **Verificación de email** | Abre el email de verificación y haz click en el link. | El sitio te confirma que tu cuenta está verificada. Puedes iniciar sesión. | [ ] |
| C11 | **Escribir reseña** | Logueado y verificado, entra al perfil de una pyme y escribe una reseña con 4 o 5 estrellas. | La reseña aparece en el perfil. El rating de la pyme se actualiza. | [ ] |
| C12 | **Recuperar contraseña** | Cierra sesión. Click en "¿Olvidaste tu contraseña?". Ingresa tu email. | Recibes el email de reset. El link te lleva a un formulario para ingresar nueva contraseña y funciona. | [ ] |
| C13 | **Noticias** | Ve a `/noticias`. Haz click en un artículo. | La página del artículo carga. El título de la pestaña cambia al título del artículo. | [ ] |
| C14 | **Página no encontrada** | Escribe una URL inválida: `/emprendimiento/negocio-inventado-xyz`. | Muestra un mensaje de "no encontrado" con un link para volver al catálogo. No explota la pantalla. | [ ] |
| C15 | **Preview al compartir** | En el detalle de un negocio, copia la URL y envíatela por WhatsApp a ti mismo. | El preview de WhatsApp muestra la imagen, nombre y descripción del negocio específico — **no** el título genérico del sitio. | [ ] |

---

## 🎭 Escenario 2: El Emprendedor

| ID | Test | Pasos a seguir | Resultado Esperado | Pasó? |
|---|---|---|---|---|
| E1 | **Inscripción — negocio físico** | Ve a "Inscribir negocio". Completa el formulario con tipo "Físico o Mixto", elige ciudad, escribe dirección y sube una foto. | Al terminar ves confirmación. Eres redirigido al Dashboard. El negocio aparece con estado "Pendiente" (amarillo). | [ ] |
| E2 | **Modo ghost** | Busca el negocio que acabas de inscribir en el catálogo público (Chrome incógnito). | **No debe aparecer.** Está pendiente de aprobación admin. | [ ] |
| E3 | **Inscripción — negocio digital** | Inscribe un segundo negocio con tipo "Online" (sin dirección física). | El formulario no bloquea por falta de coordenadas. El negocio se crea sin error. | [ ] |
| E4 | **Edición de negocio** | Desde tu panel, haz click en Editar del primer negocio. Cambia la descripción. | Los cambios se guardan y ves confirmación. El negocio muestra la descripción nueva. | [ ] |
| E5 | **Métricas del panel** | Revisa los contadores arriba en tu panel (Reseñas, Vistas, Rating). | Aparecen los valores numéricos (pueden ser 0). Sin error de consola. | [ ] |
| E6 | **Upload de galería** | En el formulario de edición, sube 2–3 fotos a la galería. | Las imágenes aparecen en el perfil público del negocio. | [ ] |

---

## 🎭 Escenario 3: El Administrador

| ID | Test | Pasos a seguir | Resultado Esperado | Pasó? |
|---|---|---|---|---|
| A1 | **Acceso al panel** | Entra a `/admin` con tu cuenta de admin. | Ves el dashboard con métricas y el menú lateral. Sin error 403. | [ ] |
| A2 | **Aprobar negocio físico** | En "Emprendimientos", filtra por estado "Pendiente". Busca el negocio del Emprendedor y apruébalo. | El estado cambia a "Activo". | [ ] |
| A3 | **Impacto en catálogo** | Vuelve al catálogo público en Chrome incógnito. | El negocio aprobado aparece en la lista **y tiene un pin en el mapa**. | [ ] |
| A4 | **Negocio digital en mapa** | Aprueba el negocio "Online" del Emprendedor. Búscalo en el mapa. | Aparece en el catálogo/lista pero **no tiene pin en el mapa** (no tiene coordenadas). | [ ] |
| A5 | **Moderación de reseña** | En "Reseñas", encuentra la que escribió el Cliente y desactiva su visibilidad. | La reseña desaparece del perfil público. No se borra de tu tabla de admin. | [ ] |
| A6 | **Gestión de noticias** | Crea una noticia desde el panel admin y publícala. | Aparece en `/noticias` de inmediato. | [ ] |

---

## Registro de bugs

Cuando algo falle, documenta aquí:

```
Bug #N — [ID del test]
Pasos:    1. [qué hice]  2. [qué hice después]
Esperado: [qué debía pasar]
Real:     [qué pasó — incluye el mensaje de error exacto]
Evidencia: [captura o texto de la consola F12]
```

---

## Tips

- **F12 → Console:** Mantén la consola abierta. Los errores rojos son bugs reales.
- **F12 → Network:** Si algo no carga, esta pestaña te muestra qué request falló y con qué código.
- **C15 (preview WhatsApp)** solo pasa después de que el SEO dinámico esté desplegado. Si falla, no es un bug de flujo — es un pendiente de SEO.
- **Contraseñas de prueba:** Usa contraseñas distintas para cada cuenta y anótalas en algún lugar temporal.
