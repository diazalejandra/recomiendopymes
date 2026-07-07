'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Guard client-side. Redirige a /login si no hay sesión, o a / si requiere admin y no lo es.
// Mientras carga la sesión muestra un spinner (evita parpadeo de redirección).
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace('/login');
    } else if (requireAdmin && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, isAdmin, requireAdmin, router]);

  if (loading || !isLoggedIn || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand)' }} />
      </div>
    );
  }

  return children;
}
