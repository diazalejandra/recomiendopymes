# Changelog - RecomiendoPymes

Todos los cambios notables de este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Unreleased] - En Desarrollo

### Añadido
- Filtro global de "Envíos nacionales" en la vista del catálogo.
- Integración de `react-helmet-async` para previsualizaciones de enlaces en redes sociales (OpenGraph tags).
- Parche en el servicio de autenticación para imprimir enlaces de activación en la consola durante el desarrollo local (cuando falta API Key de Resend).
- Auto-zoom dinámico (`fitBounds`) en el mapa de React-Leaflet para ajustarse a los pines de búsqueda.

### Cambiado
- El formulario de inscripción ahora permite la creación opcional de la foto principal.
- (Revertido) Se mantuvo la obligatoriedad de Región y Comuna en el registro de negocios para preservar la integridad de datos base.

### Solucionado
- Error 404 en subrutas de Vercel (implementado `vercel.json` con rewrites).
- Error 404 persistente en peticiones automáticas al archivo `favicon.ico`.
