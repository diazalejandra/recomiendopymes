import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewsNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h2>
      <p className="text-gray-600 mb-8">No pudimos encontrar la noticia que estás buscando.</p>
      <Link href="/noticias" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Volver a noticias
      </Link>
    </div>
  );
}
