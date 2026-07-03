import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getNewsBySlug } from '@/lib/api';
import MarkdownContent from '@/components/news/MarkdownContent';

const DEFAULT_DESC = 'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: 'Artículo no encontrado' };

  const desc = (article.excerpt || article.content || DEFAULT_DESC).slice(0, 160);
  const ogTitle = `${article.title} | RecomiendoPymes`;
  const pageUrl = `/noticias/${article.slug}`;

  return {
    title: article.title,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: ogTitle,
      description: desc,
      url: pageUrl,
      type: 'article',
      images: article.image_url ? [article.image_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: desc,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const published = article.published_at || article.created_at;

  // JSON-LD Article (NW-5) para rich results / indexación.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(article.image_url ? { image: [article.image_url] } : {}),
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(article.updated_at ? { dateModified: article.updated_at } : {}),
    author: { '@type': 'Organization', name: 'RecomiendoPymes' },
    publisher: { '@type': 'Organization', name: 'RecomiendoPymes' },
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <script id="json-ld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/noticias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors font-medium">
        <ArrowLeft size={16} /> Volver a todas las noticias
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {article.tag}
          </span>
          {published && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
              <Calendar size={14} />
              {new Date(published).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
          {article.source === 'n8n' && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              <User size={14} /> IA
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">{article.title}</h1>

        {article.excerpt && <p className="text-xl text-gray-600 leading-relaxed font-medium">{article.excerpt}</p>}
      </header>

      {article.image_url && (
        <div className="mb-12 rounded-3xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image_url} alt={article.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-sm">
        <MarkdownContent>{article.content}</MarkdownContent>
      </div>
    </article>
  );
}
