'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

// Sección de reseñas de la ficha. Recibe las reseñas iniciales desde el Server Component
// (SSR → indexables) y añade la interacción (dejar reseña, responder) del lado del cliente.
export default function ReviewsSection({ businessId, ownerUserId, initialReviews = [] }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);

  const isOwner = Boolean(user && ownerUserId && String(user.id) === String(ownerUserId));

  const handleReviewAdded = (review) => setReviews((prev) => [review, ...prev]);
  const handleResponseAdded = (updated) =>
    setReviews((prev) => prev.map((r) => ((r._id || r.id) === (updated._id || updated.id) ? updated : r)));

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
        <span>
          Reseñas {reviews.length > 0 && <span className="text-gray-400 font-medium ml-1">({reviews.length})</span>}
        </span>
      </h2>

      <div className="space-y-4 mb-8">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Aún no hay reseñas. ¡Sé el primero en calificar tu experiencia!
          </p>
        ) : (
          reviews.map((r) => (
            <ReviewItem key={r._id || r.id} review={r} isOwner={isOwner} onResponseAdded={handleResponseAdded} />
          ))
        )}
      </div>

      {!isOwner && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <ReviewForm businessId={businessId} onReviewAdded={handleReviewAdded} />
        </div>
      )}
    </section>
  );
}
