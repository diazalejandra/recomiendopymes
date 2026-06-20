# Base de Conocimientos - RecomiendoPymes

Este directorio (`docs/`) es la fuente principal de la verdad para toda la información técnica y funcional del proyecto. Aquí registramos requerimientos, decisiones arquitectónicas y el historial de cambios, de modo que cualquier desarrollador, IA o analista pueda entender el contexto del proyecto sin depender de la memoria de las personas.

## Estructura de Directorios

- **/architecture/**: Contiene los registros de decisiones arquitectónicas (ADR - Architecture Decision Records). Cada vez que tomamos una decisión técnica importante (ej. cambiar una base de datos, elegir una librería sobre otra, definir un flujo de seguridad), se registra aquí.
- **/requirements/**: Documentos de especificación funcional, historias de usuario y casos de uso. Define *qué* hace el sistema y *por qué*.
- **/changelog/**: Registro cronológico de los cambios notables (nuevas features, correcciones, mejoras).
- **[Guía de Entorno y Producción](./PRODUCTION_ENV_GUIDE.md)**: Consideraciones críticas para el manejo de variables de entorno y reglas de despliegue en Render/Vercel.

## Cómo aportar a la documentación
1. **Decisiones Técnicas**: Crea un nuevo ADR en `architecture/decisions/` usando el template disponible en `architecture/templates/0000-adr-template.md`.
2. **Nuevos Features**: Actualiza los documentos en `requirements/` antes de empezar a programar.
3. **Versiones**: Cada vez que se cierre un sprint o se lance una versión a producción, agrega una entrada en `changelog/CHANGELOG.md`.
