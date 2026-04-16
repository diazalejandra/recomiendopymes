import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/api';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getLegal('terms')
      .then(d => setContent(d.content || ''))
      .catch(() => setContent('Términos y condiciones no disponibles temporalmente.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="prose prose-gray max-w-none">
          {content.split('\n').filter(Boolean).map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-gray-700 list-disc">{line.slice(2)}</li>;
            return <p key={i} className="mb-3 text-gray-700 leading-relaxed">{line}</p>;
          })}
        </div>
      )}
    </div>
  );
}
