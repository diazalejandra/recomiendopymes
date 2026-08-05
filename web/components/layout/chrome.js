// Rutas que se renderizan SIN el header/footer público: las de auth (pantalla completa)
// y todo el panel admin (que trae su propio sidebar).
const HIDE_EXACT = ['/login', '/registro', '/verificar-email', '/recuperar-contrasena', '/reset-password'];

export function shouldHideChrome(pathname) {
  if (!pathname) return false;
  if (HIDE_EXACT.includes(pathname)) return true;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;
  return false;
}
