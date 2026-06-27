# Requerimientos del Sistema — Índice de Specs

Definición funcional por módulo. Cada spec sigue el formato **Propósito · Actores ·
Historias de usuario (US) · Reglas de negocio (RN) · Criterios de aceptación (CA) ·
Estado vs código · Decisiones · Backlog**. Los CA están redactados en estilo
Dado/Cuando/Entonces para mapearse 1:1 a casos de QA.

Método: **anclado + reconciliar** — cada spec se redacta contra el código real y se
reconcilia con las decisiones de producto.

## Mapa de módulos

| # | Módulo | Archivo | Estado |
|---|---|---|---|
| 01 | Autenticación y Usuarios | [01-auth.md](./01-auth.md) | ✅ Reconciliado |
| 02 | Catálogo y Emprendimientos | [02-negocios.md](./02-negocios.md) | ✅ Reconciliado |
| 03 | Categorías (taxonomía) | [03-categorias.md](./03-categorias.md) | ✅ Reconciliado |
| 04 | Reseñas | [04-resenas.md](./04-resenas.md) | ✅ Reconciliado |
| 05 | Mapa | [05-mapa.md](./05-mapa.md) | ✅ Reconciliado |
| 06 | Dashboard del emprendedor | [06-dashboard-emprendedor.md](./06-dashboard-emprendedor.md) | ✅ Reconciliado |
| 07 | Panel de administración | [07-admin.md](./07-admin.md) | ✅ Reconciliado |
| 08 | Noticias / Blog | [08-noticias.md](./08-noticias.md) | ✅ Reconciliado |
| 09 | SEO (transversal) | [09-seo.md](./09-seo.md) | ✅ Reconciliado (→ Next.js, ADR) |
| 10 | Legales y Privacidad | [10-legales.md](./10-legales.md) | ✅ Revisado (borradores + L-1..L-11) |
| 11 | Imágenes / Media (transversal) | [11-media.md](./11-media.md) | ✅ Reconciliado |
| 12 | Notificaciones (transversal) | [12-notificaciones.md](./12-notificaciones.md) | ✅ Reconciliado |
| 13 | Monetización (Fase 2) | [13-monetizacion.md](./13-monetizacion.md) | ✅ Borrador estratégico |
| 14 | Calidad y Operación (transversal) | [14-calidad-operacion.md](./14-calidad-operacion.md) | ✅ Borrador |

Diagnóstico transversal (gaps + consistencia): [_diagnostico-gaps-consistencia.md](./_diagnostico-gaps-consistencia.md).
Backlog consolidado y priorizado (orden de ataque): [_backlog-consolidado.md](./_backlog-consolidado.md).

Orden de trabajo por dependencias: auth → negocios → categorías → reseñas → mapa →
dashboards → admin → noticias → transversales (SEO, media) → legales.

## Backlog consolidado

Cada spec lleva su propio backlog (IDs por módulo: Auth `B-*`, Negocios `N-*`,
Categorías `C-*`, etc.). Al cerrar el mapa de specs se consolidan en un único listado
priorizado para implementación.
