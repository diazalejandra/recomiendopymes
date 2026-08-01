'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { businessApi } from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import BusinessDetailView from '@/components/business/BusinessDetailView';

const statusLabels = { active: 'Activo', pending: 'Pendiente de revisión', inactive: 'Inactivo' };

function PreviewContent() {
  const { businessId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch AUTENTICADO (con el token) → el dueño puede ver su negocio aunque esté pendiente.
    businessApi
      .get(businessId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand)' }} />
      </div>
    );
  }

  if (error || !data?.business) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No se pudo cargar la previsualización</h2>
        <p className="text-gray-500 mb-6">Puede que el emprendimiento no exista o no tengas permisos.</p>
        <Link href="/mi-negocio" className="text-blue-600 hover:underline">Volver al panel</Link>
      </div>
    );
  }

  const business = data.business;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/mi-negocio" className="text-sm text-gray-500 hover:text-blue-600 mb-4 flex items-center gap-1.5 w-fit">
        ← Volver al panel
      </Link>

      <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2 flex-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-mid)' }}>
        <span className="font-semibold">👁️ Vista previa</span>
        <span>— así se verá tu ficha.</span>
        <span className="font-medium">Estado: {statusLabels[business.status] || business.status}.</span>
        {business.status !== 'active' && <span>No es pública todavía.</span>}
      </div>

      <BusinessDetailView business={business} reviews={data.reviews || []} />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <ProtectedRoute>
      <PreviewContent />
    </ProtectedRoute>
  );
}
