# Spec — Mapa y Geolocalización

> Estado del spec: **revisado y reconciliado** (decisiones D-1..D-4) · Anclado al código a 2026-06-20 (rama `main`)
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
- **US-5** — Como emprendedor **desde casa**, quiero mostrar solo mi **zona/comuna** y no mi dirección exacta _(privacidad; ver MP-7)_.
- **US-6** — Como visitante, quiero **centrar el mapa en mi ubicación cuando yo lo pida** y ver **distancias** a los negocios _(ver MP-8)_.

## Reglas de negocio

- **RN-1** — El mapa muestra solo negocios `active` **con coordenadas** y de tipo `physical`/`both`; los `online` **no** llevan pin.
- **RN-2** — Al cargar, se intenta geolocalizar al visitante; si rechaza o no está disponible, el mapa centra en Chile. El mapa se acota a los límites de Chile.
- **RN-3** — El mapa respeta los filtros activos (ciudad, categoría, búsqueda).
- **RN-4** — La geocodificación (Nominatim) respeta su política de uso (≤1 req/s, identificación correcta), con **debounce** y **caché de coordenadas de ciudad**.
- **RN-5** — `coordinates.is_exact`: `true` si el dueño ubicó el pin; `false` si es el centroide de la ciudad.
- **RN-6** — Los íconos/colores de categoría provienen de la **lista de categorías** (no hardcodeados en el front).
- **RN-7** — Los recursos del mapa (íconos de marcador) se sirven **localmente**, sin depender de CDNs externos en runtime.
- **RN-8** — La **granularidad de ubicación depende del tipo de operación**:
  - `physical` / `both` (tienda física): dirección y **pin exacto**.
  - `online` (digital): **solo comuna de origen de despacho** (centroide / círculo), **nunca** dirección exacta.
  Es la regla por defecto, no un opt-in.
- **RN-9** — El centrado en la ubicación del usuario es **explícito** (botón "ubícame"), con **fallback por comuna** y **aviso** si la geolocalización falla; el comportamiento de centrado es **consistente** entre todas las vistas de mapa.
- **RN-10** — **"Cerca de ti"** ordena por **niveles según comuna + alcance de despacho**, no por km crudos (v1, sin adyacencia de comunas):
  1. En tu comuna (físicos + digitales con origen en tu comuna)
  2. En tu región
  3. Te llega: **envío nacional**
  4. Resto.
  Los físicos dentro de tu comuna se afinan por **distancia real (km)**. La comuna del usuario se obtiene con un **selector** (geolocalización opcional para autodetectarla).
- **RN-11** — Un negocio aparece **una sola vez** en "cerca de ti", en el nivel más alto que le aplique (los `both`/nacionales no se duplican).

## Criterios de aceptación (= casos de QA)

- **CA-1** — Dado el mapa, cuando carga, entonces muestra pines solo de negocios `active` físicos/mixtos con coordenadas; los `online` no aparecen.
- **CA-2** — Dado que permito geolocalización, cuando carga, entonces el mapa vuela a mi ubicación; si la rechazo, queda centrado en Chile.
- **CA-3** — Dado un filtro de ciudad/categoría/búsqueda, cuando lo aplico, entonces los pines se reducen en consecuencia; "Limpiar" los restaura.
- **CA-4** — Dado un pin, cuando lo abro, entonces veo la mini-ficha y el enlace al perfil funciona.
- **CA-5** — Dado que inscribo un negocio físico y escribo una dirección, cuando la selecciono, entonces se fijan coordenadas (`is_exact: true`); sin dirección, queda el centroide de la ciudad (`is_exact: false`).
- **CA-6** — Dado que el CDN de íconos no está disponible (p. ej. red restringida), cuando abro el mapa, entonces los marcadores se ven igual (recursos locales).
- **CA-7** — Dado un negocio `physical` sin coordenadas, cuando se intenta mostrar, entonces no rompe el mapa (y se invita a completar ubicación) — ver N-12.
- **CA-8** — Dado un negocio con ubicación **aproximada**, cuando se muestra, entonces aparece como zona/círculo, no como pin exacto en el domicilio (RN-8).
- **CA-9** — Dado que presiono "ubícame" y acepto, cuando carga, entonces el mapa centra en mí; si la rechazo o falla, recibo **aviso** y puedo elegir mi comuna (RN-9).
- **CA-10** — Dada mi comuna, cuando uso "cerca de ti", entonces veo primero los de mi comuna, luego mi región, luego los de envío nacional, y al final el resto (RN-10).
- **CA-11** — Dado un negocio `online`, cuando se muestra su ubicación, entonces aparece como **comuna/área** (nunca dirección exacta), aunque sea `both` con tienda física sí puede mostrar pin (RN-8).
- **CA-12** — Dado un físico en mi comuna, cuando ordeno por cercanía, entonces se afina por distancia real (km) frente a otros de mi comuna.

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

## Decisiones tomadas (2026-06-20)

- **D-1** — Geocodificación pasa a **proxy backend + caché** (cumple política de Nominatim, evita bloqueos). → RN-4, MP-2.
- **D-2** — Se **unifican** las dos implementaciones de mapa en un componente compartido. → MP-6.
- **D-3** — Fixes confirmados: íconos locales (MP-1), filtrar por `business_type` (MP-3), íconos de categoría desde la colección (MP-4), verificar `is_exact` (MP-5).
- **D-4** — Clustering y carga por viewport quedan en roadmap (R-1/R-2).
- **D-5** — **Ubicación por tipo de operación** (regla, no opt-in): físico/mixto = pin exacto; digital = solo comuna de origen de despacho (sin dirección exacta). → RN-8, MP-7.
- **D-9** — **"Cerca de ti" por niveles** (tu comuna → región → envío nacional → resto; físicos afinados por km), con **selector de comuna** + geoloc opcional. → RN-10, MP-9.
- **D-6** — **Geolocalización con control**: botón "ubícame" + fallback comuna + aviso + distancia, con centrado consistente. → RN-9, MP-8. *(Arregla el bug observado de "no siempre centra en el usuario".)*
- **D-7** — Se **mantiene el `/mapa` como vista destacada**; **"cerca de ti"** en el catálogo lo complementa (no se demota). → MP-9.
- **D-10** — "Cerca de ti" v1 = comuna → región → nacional → resto (**sin "comunas vecinas"**, evita datos de adyacencia); sin duplicados (RN-11). → RN-10/RN-11.
- **D-8** — **Geo para SEO**: coordenadas en el JSON-LD `LocalBusiness` (se ejecuta en el módulo SEO). → MP-10.

## Bug conocido (a resolver con MP-6 + MP-8)

- **BUG-1** — El centrado en la ubicación del usuario "a veces no funciona": la pestaña Mapa del catálogo (HomePage) hace `fitBounds` a todos los pines y **no** geolocaliza, mientras que `/mapa` (MapView) sí vuela al usuario; además la geolocalización falla en silencio (timeout/denegación). Causa raíz: las **dos implementaciones divergentes** (M-6) + sin feedback. Se cierra al unificar (MP-6) y con el centrado explícito (MP-8).

## Backlog derivado (decidido, pendiente de implementar)

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **MP-1** | Empaquetar íconos de marcador localmente | Bajo | Quitar dependencia de `unpkg.com` en runtime (M-1) |
| **MP-2** | Geocodificación vía proxy backend + caché (ciudad/dirección) | Medio | Cumple política Nominatim; reduce riesgo de bloqueo (M-2) |
| **MP-3** | Filtrar el mapa por `business_type` physical/both | Bajo | Hacer explícita RN-1, no depender de ausencia de coords (M-3) |
| **MP-4** | Íconos de categoría desde la colección de categorías | Bajo | Elimina `CAT_ICONS` hardcodeado/duplicado (cruce C-1/C-3) (M-4) |
| **MP-5** | Verificar/asegurar `is_exact` (pin vs centroide) | Bajo | Confirmar en `CityMapPicker`/autocomplete (M-5) |
| **MP-6** | Unificar el mapa en un componente reutilizable | Medio | HomePage + MapView comparten icons/popups/lógica (M-6); cierra BUG-1 |
| **MP-7** | Enforce granularidad por `business_type` (físico=pin exacto; digital=comuna, sin dirección) + mostrar digitales como área/comuna | Medio | Regla RN-8; privacidad negocios desde casa; cruce con inscripción e `is_exact` |
| **MP-8** | Geolocalización con control: botón "ubícame" + fallback comuna + aviso + distancia | Medio | Centrado explícito y consistente; cierra BUG-1 |
| **MP-9** | "Cerca de ti" por niveles (comuna→región→nacional→resto) + selector de comuna, en el catálogo | Medio | Modelo RN-10/RN-11; `/mapa` se mantiene destacado; cruce con Negocios y envíos |
| **MP-10** | Coordenadas en JSON-LD `LocalBusiness` | Bajo | Se implementa en el módulo SEO (cruce) |
