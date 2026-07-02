import { Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

// Metadata base del sitio (portada desde index.html del SPA). Cada página pública
// sobreescribe title/description/OG con su propio `metadata` o `generateMetadata`.
export const metadata = {
  metadataBase: new URL('https://recomiendopymes.cl'),
  title: {
    default: 'RecomiendoPymes — Catálogo de Emprendedores Chilenos',
    template: '%s | RecomiendoPymes',
  },
  description:
    'Catálogo de emprendedores chilenos. Descubre y apoya micro-emprendimientos de toda Chile.',
  keywords: [
    'emprendedores Chile',
    'catálogo emprendimientos',
    'comprar emprendedores',
    'apoyar pymes Chile',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'RecomiendoPymes',
    title: 'RecomiendoPymes — Catálogo de Emprendedores Chilenos',
    description: 'Descubre y apoya micro-emprendimientos de toda Chile.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={outfit.variable}>
      <body>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
