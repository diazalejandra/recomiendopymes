# Spec — Categorías (y taxonomía del catálogo)

> Estado del spec: **revisado y reconciliado** (decisión 2026-06-20) · Módulo backend: `modules/meta/`
> Relacionado: `02-negocios.md` (N-9 enforce categoría).

## Propósito

Definir cómo se clasifican los emprendimientos para navegar, filtrar y posicionar en
buscadores (páginas de categoría = SEO). La taxonomía debe ser **amigable para el
visitante**, consistente y mantenible.

## Decisión de diseño (2026-06-20)

- **Una categoría canónica por negocio**, elegida de una **lista fija administrada por el
  admin** (vocabulario controlado). Habilita filtros confiables, páginas de categoría con
  SEO y un catálogo limpio.
- **+ `tags` libres opcionales** por negocio (ej. `vegano`, `delivery`, `hecho a mano`)
  como capa de descubrimiento/búsqueda, **separada** de la categoría.
- **Taxonomía plana** por ahora; si crece, agrupar en 2 niveles (grupo → categoría).
- **Estilo consumidor** (referencia: Google Business Profile / Yelp, adaptado a Chile),
  **no** códigos tributarios (CIIU / actividad económica del SII): demasiado granulares y
  poco amigables para navegación.
- Opcional (futuro): flujo **"sugerir categoría"** (usuario propone → admin aprueba).

**Por qué no texto libre:** ya provocó inconsistencias en el seed (p. ej. `Clothing y
Moda`, mezcla inglés/español). El vocabulario controlado las evita.

## Modelo de datos

- **Category** (colección `categories`, ya existe): `name`, `slug`, `icon` (emoji o Lucide).
- **Business.category**: string que **debe coincidir** con una categoría existente (hoy es texto libre — ver N-9).
- **Business.tags**: `List[str]` libre, opcional (campo **nuevo** — ver backlog C-2).

## Reglas de negocio

- **RN-1** — Al inscribir/editar, `category` debe pertenecer a la lista de categorías activas; si no, se rechaza.
- **RN-2** — Los `tags` son libres pero se normalizan (minúsculas, sin espacios extra) y tienen un máximo (ej. 8 por negocio).
- **RN-3** — Solo el admin crea/edita/elimina categorías (CRUD ya existe en el panel).
- **RN-4** — Eliminar una categoría en uso debe bloquearse o reasignar los negocios afectados (no dejar negocios huérfanos).
- **RN-5** — Cada categoría tiene `slug` único para su página/lista SEO.

## Lista base propuesta (es-CL)

Consolidación del seed + cobertura típica de micro-emprendimiento chileno. Ícono sugerido (emoji); ajustable.

| Categoría | slug | Ícono |
|---|---|---|
| Alimentación y Bebidas | alimentacion-y-bebidas | 🍽️ |
| Repostería y Pastelería | reposteria-y-pasteleria | 🧁 |
| Artesanías y Manualidades | artesanias-y-manualidades | 🧶 |
| Vestuario y Moda | vestuario-y-moda | 👗 |
| Accesorios y Joyería | accesorios-y-joyeria | 💍 |
| Belleza y Cuidado Personal | belleza-y-cuidado-personal | 💄 |
| Salud y Bienestar | salud-y-bienestar | 🧘 |
| Deporte y Aire Libre | deporte-y-aire-libre | ⚽ |
| Hogar y Decoración | hogar-y-decoracion | 🛋️ |
| Jardinería y Plantas | jardineria-y-plantas | 🪴 |
| Mascotas | mascotas | 🐾 |
| Tecnología y Electrónica | tecnologia-y-electronica | 💻 |
| Fotografía y Audiovisual | fotografia-y-audiovisual | 📷 |
| Diseño y Publicidad | diseno-y-publicidad | 🎨 |
| Educación y Cursos | educacion-y-cursos | 📚 |
| Consultoría y Servicios Profesionales | consultoria-y-servicios | 💼 |
| Eventos y Celebraciones | eventos-y-celebraciones | 🎉 |
| Niños y Bebés | ninos-y-bebes | 🧸 |
| Librería y Papelería | libreria-y-papeleria | ✏️ |
| Oficios y Reparaciones | oficios-y-reparaciones | 🔧 |
| Otros | otros | 🏷️ |

## Estado vs código

| Item | Estado | Nota |
|---|---|---|
| Colección de categorías + CRUD admin | ✅ | `modules/meta/`, `/api/categories`. |
| Categoría validada al inscribir/editar | ❌ | `business.category` es texto libre (N-9). |
| `tags` por negocio | ❌ | Campo no existe (C-2). |
| Seed de categorías curado | 🟡 | El seed tiene inconsistencias (`Clothing y Moda`) (C-1). |
| Bloqueo al eliminar categoría en uso | ❓ | Verificar comportamiento del CRUD admin (C-4). |

## Backlog derivado

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **C-1** | Sembrar/normalizar la lista base curada y corregir el seed | Bajo | Reemplaza `Clothing y Moda` → `Vestuario y Moda`, etc. |
| **C-2** | Agregar campo `tags` (modelo + inscripción/edición + UI) | Medio | Lista libre normalizada, máx. 8 (RN-2) |
| **C-3** | Enforce `category` contra la lista (= N-9 de Negocios) | Bajo-Medio | Rechazar categorías inexistentes |
| **C-4** | Proteger eliminación de categoría en uso (RN-4) | Bajo | Bloquear o reasignar |
| **C-5** | Búsqueda/filtro por `tags` (descubrimiento) | Medio | Complementa la búsqueda de texto (N-8) |
