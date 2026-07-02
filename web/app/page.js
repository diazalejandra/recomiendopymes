// Placeholder de la home (Fase 1: scaffold). En la Fase 2 se reemplaza por el
// catálogo real como Server Component con fetch server-side y metadata SEO.
export default function HomePage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-24 text-center">
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6"
        style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
      >
        Next.js · Fase 1 (scaffold)
      </span>
      <h1 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--ink)' }}>
        RecomiendoPymes
      </h1>
      <p className="text-lg" style={{ color: 'var(--muted)' }}>
        Shell de la migración a Next.js funcionando. El sistema de diseño (tokens, tipografía
        y layout) está portado. Las páginas públicas se migran en la Fase 2.
      </p>
    </section>
  );
}
