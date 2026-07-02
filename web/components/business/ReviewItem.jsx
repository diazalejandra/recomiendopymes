// Tarjeta de reseña — SOLO display (Server Component). Portada desde el SPA.
// El formulario de respuesta del dueño es interactivo + requiere sesión → Fase 3.

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </span>
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

export default function ReviewItem({ review }) {
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

      {/* Respuesta del emprendedor */}
      {review.owner_response && (
        <div className="mt-3 ml-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Respuesta del emprendedor</p>
          <p className="text-sm text-blue-800">{review.owner_response.text}</p>
          {review.owner_response.created_at && (
            <p className="text-xs text-blue-400 mt-1">{formatDate(review.owner_response.created_at)}</p>
          )}
        </div>
      )}
    </div>
  );
}
