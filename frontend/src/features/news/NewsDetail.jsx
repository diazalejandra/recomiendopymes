import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsApi } from '../../utils/api';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DEFAULT_TITLE = 'RecomiendoPymes — Catálogo de Emprendedores Chilenos';
const DEFAULT_DESC = 'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.';

function setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    newsApi.getBySlug(slug)
      .then(setArticle)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const desc = (article.excerpt || article.content || '').slice(0, 160);
    const pageUrl = `https://recomiendopymes.cl/noticias/${article.slug}`;
    document.title = `${article.title} | RecomiendoPymes`;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', `${article.title} | RecomiendoPymes`);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', article.image_url || '');
    setMeta('property', 'og:url', pageUrl);
    setMeta('name', 'twitter:title', `${article.title} | RecomiendoPymes`);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', article.image_url || '');
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('name', 'description', DEFAULT_DESC);
      setMeta('property', 'og:title', DEFAULT_TITLE);
      setMeta('property', 'og:description', 'Descubre y apoya micro-emprendimientos de toda Chile.');
      setMeta('property', 'og:image', '');
      setMeta('property', 'og:url', 'https://recomiendopymes.cl');
    };
  }, [article]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded w-24 mb-8 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded w-full mb-4 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-12 animate-pulse" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h2>
        <p className="text-gray-600 mb-8">No pudimos encontrar la noticia que estás buscando.</p>
        <Link to="/noticias" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Volver a noticias
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <Link to="/noticias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors font-medium">
        <ArrowLeft size={16} /> Volver a todas las noticias
      </Link>
      
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {article.tag}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <Calendar size={14} />
            {new Date(article.published_at || article.created_at).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
          {article.source === 'n8n' && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              <User size={14} /> IA
            </div>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>
        
        {article.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            {article.excerpt}
          </p>
        )}
      </header>

      {article.image_url && (
        <div className="mb-12 rounded-3xl overflow-hidden shadow-md">
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      <div className="prose prose-lg prose-blue max-w-none 
        prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-2xl prose-img:shadow-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
