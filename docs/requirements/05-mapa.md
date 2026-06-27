# Spec — Mapa y Geolocalización

> Estado del spec: **borrador para revisión** · Anclado al código a 2026-06-20 (rama `main`)
> Frontend: `features/catalog/MapView.jsx`, `HomePage.jsx` (pestaña mapa), `features/business/AddressAutocomplete.jsx`, `CityMapPicker.jsx`

## Propósito

Permitir descubrir emprendimientos **con presencia física** en un mapa, y permitir al
emprendedor **ubicar su negocio** al inscribirlo (autocompletado de dirección + pin).
Usa Leaflet + OpenStreetMap (sin API key) y Nominatim para geocodificar.

## Actores

| Actor | Capacidad |
|---|---|
| Visitante | Ver el mapa, filtrar, abrir mini-ficha y entrar al perfil. |
| Emprendedor | Ubicar su negocio (dirección → coordenadas, pin ajustable) al inscribir/editar. |

## Historias de usuario

- **US-1** — Como visitante, quiero ver en un mapa los negocios con ubicación, centrado en mi posición o, si la rechazo, en Chile.
- **US-2** — Como visitante, quiero filtrar el mapa por ciudad, categoría y búsqueda.
- **US-3** — Como visitante, quiero abrir un popup con mini-ficha (foto, nombre, categoría, ciudad, rating) y entrar al perfil.
- **US-4** — Como emprendedor, quiero ubicar mi negocio escribiendo la dirección (autocompletado) y/o ajustando el pin, para fijar sus coordenadas.

## Reglas de negocio

- **RN-1** — El mapa muestra solo negocios `active` **con coordenadas** y de tipo `physical`/`both`; los `online` **no** llevan pin.
- **RN-2** — Al cargar, se intenta geolocalizar al visitante; si rechaza o no está disponible, el mapa centra en Chile. El mapa se acota a los límites de Chile.
- **RN-3** — El mapa respeta los filtros activos (ciudad, categoría, búsqueda).
- **RN-4** — La geocodificación (Nominatim) respeta su política de uso (≤1 req/s, identificación correcta), con **debounce** y **caché de coordenadas de ciudad**.
- **RN-5** — `coordinates.is_exact`: `true` si el dueño ubicó el pin; `false` si es el centroide de la ciudad.
- **RN-6** — Los íconos/colores de categoría provienen de la **lista de categorías** (no hardcodeados en el front).
- **RN-7** — Los recursos del mapa (íconos de marcador) se sirven **localmente**, sin depender de CDNs externos en runtime.

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el mapa, cuando carga, entonces muestra pines solo de negocios `active` físicos/mixtos con coordenadas; los `online` no aparecen.
- **CA-2** — Dado que permito geolocalización, cuando carga, entonces el mapa vuela a mi ubicación; si la rechazo, queda centrado en Chile.
- **CA-3** — Dado un filtro de ciudad/categoría/búsqueda, cuando lo aplico, entonces los pines se reducen en consecuencia; "Limpiar" los restaura.
- **CA-4** — Dado un pin, cuando lo abro, entonces veo la mini-ficha y el enlace al perfil funciona.
- **CA-5** — Dado que inscribo un negocio físico y escribo una dirección, cuando la selecciono, entonces se fijan coordenadas (`is_exact: true`); sin dirección, queda el centroide de la ciudad (`is_exact: false`).
- **CA-6** — Dado que el CDN de íconos no está disponible (p. ej. red restringida), cuando abro el mapa, entonces los marcadores se ven igual (recursos locales).
- **CA-7** — Dado un negocio `physical` sin coordenadas, cuando se intenta mostrar, entonces no rompe el mapa (y se invita a completar ubicación) — ver N-12.

## Roadmap (futuro / Fase 2)

- **R-1 — Clustering de marcadores** (agrupar pines en zonas densas) para legibilidad y rendimiento.
- **R-2 — Carga por viewport/bbox** en vez de traer hasta 500 negocios al cliente.
- **R-3 — Geocodificación vía proxy del backend** con caché persistente (cumple política de Nominatim y reduce riesgo de bloqueo).

## Estado vs código (diagnóstico)

| Item | Estado | Nota |
|---|---|---|
| US-1 Mapa + geolocalización | ✅ | `MapView` centra en Chile / vuela a usuario. |
| US-2 Filtros | ✅ | Ciudad, categoría, búsqueda (client-side). |
| US-3 Popup mini-ficha | ✅ | Foto, categoría, rating, link al perfil. |
| US-4 Geocodificar al inscribir | ✅ | `AddressAutocomplete` (Nominatim, debounce 600ms). |
| RN-1 Solo físicos/mixtos | ❌ | Filtra por **coordenadas**, no por `business_type` (M-3). |
| RN-4 Política Nominatim + caché ciudad | 🟡 | Debounce ✅; **sin caché** y llamadas **directas del browser** (M-2). |
| RN-5 `is_exact` | ❓ | Confirmar que `CityMapPicker`/autocomplete lo setean bien (M-5). |
| RN-6 Íconos desde categorías | ❌ | `CAT_ICONS` hardcodeado y duplicado, con nombres viejos (M-4). |
| RN-7 Recursos locales | ❌ | Íconos de marcador desde `unpkg.com` en runtime (M-1). |

## Hallazgos / decisiones pendientes

- **M-1 (robustez, fix)** — Los íconos de marcador de Leaflet se cargan de `unpkg.com`. Empaquetarlos localmente. *(fix)*
- **M-2 (decisión)** — Nominatim se llama directo desde el navegador, sin caché. ¿Pasamos a **proxy backend + caché** (cumple política, evita bloqueo) o lo dejamos directo por ahora? *(decisión)*
- **M-3 (gap)** — El mapa no filtra por `business_type` (depende de que los online no tengan coords). Hacer explícita la regla RN-1. *(fix)*
- **M-4 (limpieza/cruce)** — `CAT_ICONS` hardcodeado y duplicado (MapView + HomePage) con nombres viejos. Mover el ícono a la colección de categorías (cruce con C-1/C-3). *(fix)*
- **M-5 (verificar)** — Confirmar que `is_exact` se setea correctamente (true al ubicar pin, false al usar centroide).
- **M-6 (decisión)** — Hay **dos implementaciones de mapa** (pestaña en HomePage + `MapView`). ¿Las unificamos en un componente compartido? *(decisión)*
- **M-7 (escala)** — Carga hasta 500 negocios al cliente y filtra en el browser (= N-7); sin clustering. A roadmap (R-1/R-2).
