import { getLegal } from '@/lib/api';
import MarkdownContent from '@/components/news/MarkdownContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de RecomiendoPymes.',
  alternates: { canonical: '/privacidad' },
};

export default async function PrivacyPage() {
  let content = '';
  try {
    content = await getLegal('privacy');
  } catch {
    content = '';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
      {content ? (
        <div className="prose prose-gray max-w-none">
          <MarkdownContent>{content}</MarkdownContent>
        </div>
      ) : (
        <p className="text-gray-500">Política de privacidad no disponible temporalmente.</p>
      )}
    </div>
  );
}
