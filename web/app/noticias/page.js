import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { getNews } from '@/lib/api';

// Render dinámico (SSR on-demand): evita pre-render en build y así el build no depende
// de que el backend esté arriba (CI). Sigue siendo HTML server-rendered indexable.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Noticias y Recursos',
  description:
    'Novedades, fondos concursables y recursos para hacer crecer tu emprendimiento en Chile.',
  alternates: { canonical: '/noticias' },
};

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default async function NewsListPage() {
  const news = await getNews(50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 flex justify-center md:justify-start items-center gap-3">
          <Newspaper className="text-primary w-8 h-8" />
          Noticias y Recursos
        </h1>
        <p className="text-gray-600 max-w-2xl text-lg">
          Mantente informado con las últimas novedades, fondos concursables, y recursos para hacer crecer tu emprendimiento.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <Newspaper className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aún no hay noticias</h3>
          <p className="mt-1 text-gray-500">Pronto publicaremos nuevo contenido.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/noticias/${item.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {item.image_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-100">
                  <Newspaper className="w-12 h-12 text-blue-200" />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.tag}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{formatDate(item.created_at)}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.excerpt || (item.content ? item.content.substring(0, 150) + '...' : '')}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-primary font-medium text-sm">
                  Leer artículo completo →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
