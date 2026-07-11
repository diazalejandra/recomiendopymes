'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { reviewApi, authApi } from '@/utils/api';

export default function ReviewForm({ businessId, onReviewAdded }) {
  const { isLoggedIn, isEmailVerified } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="border rounded-xl p-6 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="mb-3" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>¿Quieres dejar una reseña?</p>
        <Link href="/login" className="inline-block px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--brand)', color: '#fff' }}>
          Inicia sesión
        </Link>
        <Link href="/registro" className="ml-3 text-sm font-medium hover:underline" style={{ color: 'var(--brand)' }}>o regístrate gratis</Link>
      </div>
    );
  }

  if (!isEmailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await authApi.resendVerification();
        toast.success('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      } catch {
        toast.error('Error al reenviar el email');
      } finally {
        setResending(false);
      }
    };
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm font-medium mb-1">Verifica tu email para dejar comentarios</p>
        <p className="text-amber-700 text-xs mb-3">Te enviamos un enlace de verificación al registrarte. Revisa tu carpeta de spam.</p>
        <button onClick={handleResend} disabled={resending} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50">
          {resending ? 'Reenviando...' : 'Reenviar verificación'}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Selecciona una calificación');
    setLoading(true);
    try {
      const review = await reviewApi.create(businessId, { rating, comment });
      toast.success('¡Gracias por tu reseña! Ya está publicada.');
      setRating(0);
      setComment('');
      if (onReviewAdded) onReviewAdded(review);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al publicar la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Deja tu reseña</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
            className={`text-2xl transition-colors ${i <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-gray-500 ml-2 self-center">{rating}/5</span>}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comparte tu experiencia (mínimo 10 caracteres)..."
        required minLength={10} maxLength={500} rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary resize-none"
      />
      <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? 'Publicando...' : 'Publicar reseña'}
      </button>
    </form>
  );
}
