import Link from 'next/link';

// Se renderiza cuando la ficha llama notFound() (slug inexistente o negocio no visible).
// Devuelve HTTP 404 (correcto para SEO). El texto coincide con el que espera la malla e2e.
export default function BusinessNotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Emprendimiento no encontrado</h2>
      <Link href="/" className="text-blue-600 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  );
}
