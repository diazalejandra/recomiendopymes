import { getCategories, getCities } from '@/lib/api';

// Slug SEO-friendly: sin acentos, minúsculas, separado por guiones.
// "Artesanías y Manualidades" -> "artesanias-y-manualidades"; "Temuco" -> "temuco".
export function toSlug(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quita acentos/diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resuelve un slug de URL al nombre real (para consultar el backend, que filtra por nombre
// exacto). Devuelve null si no hay categoría/ciudad que coincida.
export async function resolveCategory(slug) {
  const categories = await getCategories();
  return categories.find((c) => toSlug(c) === slug) || null;
}

export async function resolveCity(slug) {
  const cities = await getCities();
  return cities.find((c) => toSlug(c) === slug) || null;
}
