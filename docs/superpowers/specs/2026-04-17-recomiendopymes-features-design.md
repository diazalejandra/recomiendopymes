# Design Spec: RecomiendoPymes Strategic Features (EventGo response)

**Date Constraints:** 2026-04-17

## 1. Vista de Emprendedor y Métricas
- **Objetivo:** Darle más valor a la cuenta de emprendedor sumando métricas reales para fidelización.
- **Data:** El Backend ya cuenta con la métrica pasiva de `view_count` (visitas a la ficha pública).
- **UI:** En la parte superior de su Panel actual, sumar un pequeño Dashboard visual que muestre la cantidad de visitas que su ficha ha recibido, motivándolos a compartir su link.

## 2. Oferta del Día
- **Objetivo:** Generar FOMO y destacar oportunidades hiper-locales.
- **Modelo de Datos:** Añadir un subdocumento `active_offer` (con Título, Descuento y Fecha de Expiración) al modelo `Business`.
- **UI Catalogo:** Los negocios con una oferta activa (y no expirada) tendrán un badge vibrante (ej. 🔥 "Oferta: 15% OFF") en su tarjeta de lista y en su miniatura del mapa.
- **UI Perfil:** Un banner destacado en el perfil mostrando los detalles de la oferta.
- **Regla:** Solo 1 oferta simultánea por negocio para simplificar la interfaz temporal.

## 3. Botón Whatsapp Directo
- **Objetivo:** Facilitar la métrica más importante (leads directos).
- **UI:** Un botón Call-to-Action principal en la ficha: "Contactar por WhatsApp".
- **Lógica:** Generar el link con el prefijo `wa.me` usando el número registrado del negocio, inyectando un texto amable ("Hola, los vi en RecomiendoPymes..."). No requiere guardar clics extra (nos quedamos métrica de vistas).

## 4. Tipos de Entrega y "Puntos de Encuentro"
- **Objetivo:** Clasificar las vías logísticas de las PYMES modernas.
- **Modelo:** Actualizar el esquema backend de `delivery_type` para soportar un Array o categorías precisas:
  - `store_pickup` (Retiro en tienda)
  - `home_delivery` (Envío a domicilio)
  - `meeting_point` (Puntos de encuentro)
- **UI Perfil:** Incorporar una caja pequeña tipo "Cómo entrega" donde se listen estas 3 opciones con íconos bonitos. (Ej: "Puntos de encuentro: ¡Sí, consulta con el vendedor!").

## 5. Separación Mapa vs Lista (Envíos Nacionales)
- **Objetivo:** Diferenciar búsqueda física vs cobertura geográfica.
- **Regla Mapa:** El componente del Mapa **SIEMPRE** se enfocará solo en negocios cercanos físicamente usando Latitud/Longitud (Búsqueda de vecindario).
- **Regla Catálogo (Grid/Lista):** 
  - Tendrá un toggle switch destacado arriba: `"Incluir despachos nacionales"` (o simplemente `"Mostrar envíos hacia acá"`).
  - Cuando esté encendido, la búsqueda se expandirá para incluir registros cuyo `delivery_type` ofrezca despachos a nivel nacional / hacia esa región, aunque no estén en el mapa.

## 6. Chatbot Asistente ("Simplificado")
- **Objetivo:** Una navegación basada en chat.
- **Implementación Lógica:** Un componente React flotante. Toma la frase libre (Ej: "Ropa en santiago"), el frontend extrae las palabras y alimenta localmente al filtro de Catálogo existente.
- **Costo:** Gratis. Basado 100% en lógica cliente/JS de coincidencia de palabras.
