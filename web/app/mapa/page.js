import MapExplorer from '@/components/map/MapExplorerDynamic';

export const metadata = {
  title: 'Mapa de emprendimientos',
  description: 'Explora en el mapa los micro-emprendimientos chilenos por ciudad y categoría. Encuentra negocios cerca de ti.',
  alternates: { canonical: '/mapa' },
};

export default function MapaPage() {
  return <MapExplorer />;
}
