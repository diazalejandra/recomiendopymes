import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import ReviewItem from '../business/ReviewItem';

export default function MyReviews() {
  const { businessId } = useParams();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewApi.list(businessId)
      .then(data => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleResponseAdded = (updated) =>
    setReviews(prev => prev.map(r => (r._id || r.id) === (updated._id || updated.id) ? updated : r));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/mi-negocio" className="text-sm text-gray-500 hover:text-primary mb-6 inline-block">
        ← Volver al dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reseñas {reviews.length > 0 && <span className="text-gray-400 font-normal text-lg">({reviews.length})</span>}
      </h1>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Aún no hay reseñas para este emprendimiento.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <ReviewItem
              key={r._id || r.id}
              review={r}
              isOwner={true}
              onResponseAdded={handleResponseAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
