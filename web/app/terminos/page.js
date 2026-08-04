import { getLegal } from '@/lib/api';
import MarkdownContent from '@/components/news/MarkdownContent';

// Dinámico: el contenido es admin-editable y no queremos acoplar el build al backend.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de RecomiendoPymes.',
  alternates: { canonical: '/terminos' },
};

export default async function TermsPage() {
  let content = '';
  try {
    content = await getLegal('terms');
  } catch {
    content = '';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
      {content ? (
        <div className="prose prose-gray max-w-none">
          <MarkdownContent>{content}</MarkdownContent>
        </div>
      ) : (
        <p className="text-gray-500">Términos y condiciones no disponibles temporalmente.</p>
      )}
    </div>
  );
}
