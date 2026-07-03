'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown usa hooks internamente, así que debe renderizarse como client component.
// El contenido igual queda en el HTML inicial (Next hace SSR de los client components),
// por lo que el artículo sigue siendo indexable.
export default function MarkdownContent({ children }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
}
