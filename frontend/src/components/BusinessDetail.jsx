import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import ReviewForm from './ReviewForm';
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
  Share2
} from 'lucide-react';
import { mockBusinesses } from '../mock';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviews, setNewReviews] = useState([]);

  const handleReviewSubmit = (review) => {
    setNewReviews([review, ...newReviews]);
    setShowReviewForm(false);
  };
  
  const business = mockBusinesses.find(b => b.id === id);
  
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
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
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      github: Github,
      youtube: Youtube,
      website: Globe,
      etsy: Globe,
      pinterest: Globe
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="font-semibold text-gray-900">{business.owner}</p>
                    </div>
                  </div>
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
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">About</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{business.description}</p>
            </div>

            <Separator />

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Connect</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(business.socialLinks).map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="outline"
                    className="justify-start space-x-3 py-6 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => window.open(url, '_blank')}
                  >
                    {getSocialIcon(platform)}
                    <span className="capitalize font-medium">{platform}</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Review Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Reviews & Ratings</h3>
                <Button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
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

              {/* New Reviews Display */}
              {newReviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Recent Reviews</h4>
                  {newReviews.map((review) => (
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
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Review Form */}
              {showReviewForm && (
                <ReviewForm 
                  businessName={business.name}
                  onReviewSubmit={(review) => {
                    setNewReviews([review, ...newReviews]);
                    setShowReviewForm(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;