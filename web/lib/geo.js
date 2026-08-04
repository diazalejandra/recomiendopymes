// Mapea la dirección devuelta por Nominatim (addressdetails) a nuestra región/comuna.
// Los nombres de Nominatim no calzan exacto con REGIONS_DATA, así que normalizamos
// (sin acentos, minúsculas) y hacemos match tolerante (igualdad → contención).

function norm(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * @param {object} address - objeto `address` de Nominatim.
 * @param {object} regionsData - { "Región X": ["Comuna A", ...], ... }
 * @returns {{region: string, city: string} | null} solo lo que se pudo resolver.
 */
export function matchRegionCity(address, regionsData) {
  if (!address || !regionsData) return null;

  const nState = norm(address.state || address.region || '');

  // Región: la clave nuestra cuya forma normalizada coincide o está contenida en el `state`.
  let region = '';
  if (nState) {
    region =
      Object.keys(regionsData).find((r) => norm(r) === nState) ||
      Object.keys(regionsData).find((r) => {
        const nr = norm(r);
        return nr.includes(nState) || nState.includes(nr);
      }) ||
      '';
  }

  // Comuna: Nominatim la reparte en campos distintos. Probamos candidatos del MÁS específico
  // (municipality/city_district = comuna real) al más amplio (city suele ser el área metro).
  // Nos quedamos con el primero que sea una comuna de la región resuelta.
  const candidates = [
    address.municipality, address.city_district, address.town, address.village,
    address.hamlet, address.city, address.county, address.suburb,
  ].filter(Boolean);

  const pool = region ? regionsData[region] || [] : Object.values(regionsData).flat();
  let city = '';
  for (const cand of candidates) {
    const nc = norm(cand);
    const match = pool.find((c) => norm(c) === nc) || pool.find((c) => norm(c).includes(nc) || nc.includes(norm(c)));
    if (match) {
      city = match;
      break;
    }
  }

  // Si encontramos la comuna pero no la región, derivar la región desde la comuna.
  if (city && !region) {
    region = Object.keys(regionsData).find((r) => (regionsData[r] || []).includes(city)) || '';
  }

  return region || city ? { region, city } : null;
}
