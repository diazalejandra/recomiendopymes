import { Link } from 'react-router-dom';

// Stub — se implementará en Plan 3
export default function EditBusiness() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">🛠️</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar emprendimiento</h1>
      <p className="text-gray-500 mb-6">Esta función estará disponible próximamente.</p>
      <Link to="/mi-negocio" className="text-primary hover:underline">← Volver al dashboard</Link>
    </div>
  );
}
