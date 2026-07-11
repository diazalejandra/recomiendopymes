'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { reviewApi } from '@/utils/api';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

function formatDate(value, opts = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CL', opts);
  } catch {
    return '';
  }
}

export default function ReviewItem({ review, isOwner, onResponseAdded }) {
  const { isLoggedIn } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await reviewApi.addResponse(review._id || review.id, { text: responseText });
      toast.success('Respuesta publicada exitosamente.');
      setShowResponseForm(false);
      if (onResponseAdded) onResponseAdded(updated);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al publicar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{review.author_name}</p>
          <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="text-sm text-gray-700">{review.comment}</p>

      {review.owner_response && (
        <div className="mt-3 ml-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Respuesta del emprendedor</p>
          <p className="text-sm text-blue-800">{review.owner_response.text}</p>
          {review.owner_response.created_at && (
            <p className="text-xs text-blue-400 mt-1">{formatDate(review.owner_response.created_at)}</p>
          )}
        </div>
      )}

      {isOwner && !review.owner_response && isLoggedIn && (
        <div className="mt-3">
          {!showResponseForm ? (
            <button onClick={() => setShowResponseForm(true)} className="text-xs text-primary hover:underline">
              Responder a esta reseña
            </button>
          ) : (
            <form onSubmit={handleSubmitResponse} className="mt-2">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                required minLength={5} maxLength={500} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {loading ? 'Publicando...' : 'Publicar respuesta'}
                </button>
                <button type="button" onClick={() => setShowResponseForm(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
