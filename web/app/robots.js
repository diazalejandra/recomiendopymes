const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://recomiendopymes.cl').replace(/\/$/, '');

// robots.txt: permite todo lo público, bloquea rutas privadas/no indexables y apunta al sitemap.
// (/admin y /mi-negocio aún no existen en web; dejamos el bloqueo listo para cuando lleguen.)
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/mi-negocio', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
