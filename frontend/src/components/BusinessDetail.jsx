import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import ReviewForm from './ReviewForm';
import { businessAPI, reviewAPI, handleApiError } from '../utils/api';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  User, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Github, 
  Youtube, 
  Globe,
  ExternalLink,
  Heart,
  Share2,
  Loader2
} from 'lucide-react';
import TikTokIcon from './icons/TikTokIcon';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // API data state
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const { toast } = useToast();

  // Fetch business data and reviews
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await businessAPI.getBusinessById(id);
        setBusiness(response.business);
        setReviews(response.reviews || []);
      } catch (error) {
        const errorInfo = handleApiError(error, 'Failed to load business details');
        setError(errorInfo.message);
        
        if (errorInfo.status === 404) {
          toast({
            title: "Business Not Found",
            description: "The business you're looking for doesn't exist.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessData();
  }, [id, toast]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      setReviewsLoading(true);
      await reviewAPI.createReview(id, reviewData);
      
      // Refresh business data to get updated rating
      const response = await businessAPI.getBusinessById(id);
      setBusiness(response.business);
      setReviews(response.reviews || []);
      
      setShowReviewForm(false);
      toast({
        title: "Review Submitted! 🌟",
        description: "Thank you for your feedback! Your review helps other customers.",
      });
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to submit review');
      toast({
        title: "Submission Failed",
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost"
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </div>
        </header>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading business details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost"
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </div>
        </header>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Business Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The business you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-5 h-5">
          <Star className="w-5 h-5 text-gray-300 absolute" />
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 absolute clip-path-half" />
        </div>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
    
    return stars;
  };

  const getSocialIcon = (platform) => {
    const iconMap = {
      website: Globe,
      instagram: Instagram,
      facebook: Facebook,
      tiktok: TikTokIcon,
      twitter: Twitter,
      youtube: Youtube
    };
    
    const Icon = iconMap[platform] || Globe;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost"
            className="hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
              <img
                src={business.gallery[selectedImage]}
                alt={`${business.name} - Image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {business.gallery.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    selectedImage === index ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${business.name} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 font-medium"
                >
                  {business.category}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={isFavorited ? 'text-red-500 border-red-200' : 'text-gray-500'}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(business.rating)}
              </div>
              <span className="text-xl font-bold text-gray-900">{business.rating}</span>
              <span className="text-gray-600">({business.reviews} reviews)</span>
            </div>

            {/* Business Details */}
            <Card className="border-gray-200">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{business.location}, {business.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Established</p>
                      <p className="font-semibold text-gray-900">{business.established}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">About</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{business.description}</p>
              
              {/* Social Links - Integrated with About */}
              <div className="pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Connect with us</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(business.socialLinks)
                    .filter(([platform, url]) => url && url.trim() !== '' && 
                      ['website', 'instagram', 'facebook', 'tiktok', 'twitter', 'youtube'].includes(platform))
                    .map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="p-3 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 flex items-center space-x-2"
                      onClick={() => window.open(url, '_blank')}
                      title={`Visit our ${platform}`}
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize text-sm font-medium">{platform === 'website' ? 'Website' : platform}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Review Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Reviews & Ratings</h3>
                <Button 
                  onClick={() => {
                    if (!showReviewForm) {
                      setShowReviewForm(true);
                      // Scroll to review form after it renders
                      setTimeout(() => {
                        document.getElementById('review-form-section')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    } else {
                      setShowReviewForm(false);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </Button>
              </div>
              
              {/* Current Rating Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{business.rating}</div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      {renderStars(business.rating)}
                    </div>
                    <div className="text-sm text-gray-600">{business.reviews} reviews</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-2">Recent customer feedback:</div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <div className="text-sm">Excellent service and quality!</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {Array.from({length: 4}).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          <Star className="w-3 h-3 text-gray-300" />
                        </div>
                        <div className="text-sm">Great experience, highly recommend!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Display */}
              {reviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Customer Reviews</h4>
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {Array.from({length: 5}).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">{review.reviewer}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Review Form */}
              {showReviewForm && (
                <div id="review-form-section">
                  <ReviewForm 
                    businessName={business.name}
                    onReviewSubmit={handleReviewSubmit}
                    isSubmitting={reviewsLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;