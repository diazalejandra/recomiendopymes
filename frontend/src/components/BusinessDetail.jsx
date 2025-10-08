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
  Loader2,
  Building
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
              <div className="space-y-1">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 font-medium"
                >
                  {business.category}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                {/* Stars under title */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(business.rating)}
                  </div>
                  {business.rating > 0 && (
                    <span className="text-xl font-bold text-gray-900">{business.rating}</span>
                  )}
                  <span className="text-gray-600">({business.reviews || 0} reviews)</span>
                </div>
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
            
            {/* Location and Established */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  {(business.location || business.city) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">
                          {business.location && business.city 
                            ? `${business.location}, ${business.city}`
                            : business.location || business.city || 'Location not specified'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Established */}
                  {business.established && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Established</p>
                        <p className="font-semibold text-gray-900">Est. {business.established}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Type & Delivery Info */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Business Type */}
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {business.business_type === 'both' ? 'Online & Physical' : 
                         business.business_type === 'online' ? 'Online Store' : 'Physical Location'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Delivery Type */}
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Service Area</p>
                      <p className="font-semibold text-gray-900">
                        {business.delivery_type === 'local' ? 'Local Delivery Only' :
                         business.delivery_type === 'nationwide' ? 'Nationwide Delivery' :
                         business.delivery_type === 'pickup_only' ? 'Pickup Only' :
                         business.delivery_type === 'local_and_pickup' ? 'Local Delivery & Pickup' :
                         'Contact for Details'}
                      </p>
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
                    {business.rating > 0 ? (
                      <>
                        <div className="text-3xl font-bold text-gray-900">{business.rating}</div>
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          {renderStars(business.rating)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-medium text-gray-500 mb-2">No ratings yet</div>
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                        </div>
                      </>
                    )}
                    <div className="text-sm text-gray-600">{business.reviews} reviews</div>
                  </div>
                  {business.rating > 0 && reviews.length > 0 && (
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-2">Recent customer feedback:</div>
                      <div className="space-y-1">
                        {reviews.slice(0, 2).map((review, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {Array.from({length: 5}).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <div className="text-sm truncate">{review.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {business.rating === 0 && (
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        Be the first to leave a review for this business!
                      </div>
                    </div>
                  )}
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

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Entrepreneur <span className="text-yellow-400">Catalog</span>
                </h3>
                <p className="text-gray-400 mb-4">
                  Connecting passionate entrepreneurs with customers who value local businesses and unique services.
                </p>
                <div className="flex space-x-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">For Entrepreneurs</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/list-business')}
                    className="block text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    List Your Business
                  </button>
                  <button 
                    onClick={() => navigate('/terms')}
                    className="block text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Terms & Conditions
                  </button>
                </div>
              </div>

              {/* CTA Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Join Our Community</h4>
                <p className="text-gray-400 mb-4 text-sm">
                  Showcase your business and connect with potential customers - completely free forever!
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate('/list-business')}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 transition-colors duration-200"
                >
                  Get Listed Today
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Entrepreneur Catalog. All rights reserved. | Free business listings for life.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BusinessDetail;