// Mapea la dirección de Nominatim a nuestra región/comuna. Los nombres no calzan exacto con
// REGIONS_DATA, así que normalizamos (sin acentos, minúsculas) y hacemos match tolerante.

function norm(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function findRegion(nState, regionsData) {
  if (!nState) return '';
  return (
    Object.keys(regionsData).find((r) => norm(r) === nState) ||
    Object.keys(regionsData).find((r) => {
      const nr = norm(r);
      return nr.includes(nState) || nState.includes(nr);
    }) ||
    ''
  );
}

/**
 * @param {object} address - objeto `address` de Nominatim.
 * @param {string} displayName - `display_name` de Nominatim (ordenado de específico a general).
 * @param {object} regionsData - { "Región X": ["Comuna A", ...], ... }
 * @returns {{region: string, city: string} | null} solo lo que se pudo resolver.
 */
export function matchRegionCity(address, displayName, regionsData) {
  if (!regionsData) return null;

  let region = findRegion(norm(address?.state || address?.region || ''), regionsData);
  const pool = region ? regionsData[region] || [] : Object.values(regionsData).flat();

  // Comuna: recorrer las partes del display_name (más específico → más general) y quedarse con
  // la primera que sea una comuna de la región. En el Gran Santiago la comuna real (Quilicura,
  // Maipú…) aparece ANTES que "Santiago" (el área metropolitana), así que se resuelve bien.
  const parts = (displayName || '').split(',').map((p) => norm(p)).filter(Boolean);
  let city = '';
  // Pasada 1: coincidencia exacta (evita falsos positivos de contención en calles).
  for (const part of parts) {
    const m = pool.find((c) => norm(c) === part);
    if (m) { city = m; break; }
  }
  // Pasada 2: contención, solo si no hubo exacta.
  if (!city) {
    for (const part of parts) {
      const m = pool.find((c) => {
        const nc = norm(c);
        return nc.length > 3 && (part.includes(nc) || nc.includes(part));
      });
      if (m) { city = m; break; }
    }
  }

  // Fallback: campos del address object si el display_name no dio nada.
  if (!city && address) {
    const candidates = [
      address.municipality, address.city_district, address.town, address.village,
      address.hamlet, address.city, address.county, address.suburb,
    ].filter(Boolean);
    for (const cand of candidates) {
      const nc = norm(cand);
      const m = pool.find((c) => norm(c) === nc);
      if (m) { city = m; break; }
    }
  }

  if (city && !region) {
    region = Object.keys(regionsData).find((r) => (regionsData[r] || []).includes(city)) || '';
  }

  return region || city ? { region, city } : null;
}
