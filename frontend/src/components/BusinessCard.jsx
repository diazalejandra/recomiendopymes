import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Instagram, Facebook, Twitter, Linkedin, Github, Youtube, Globe, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessCard = ({ business, viewMode = 'grid' }) => {
  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate(`/business/${business.id}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 absolute clip-path-half" />
        </div>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
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
    return <Icon className="w-4 h-4" />;
  };

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image */}
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden">
              <img
                src={business.image}
                alt={business.name}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={handleImageClick}
              />
              <div className="absolute top-2 right-2">
                <Badge 
                  variant="secondary" 
                  className="bg-white/90 text-gray-700 backdrop-blur-sm font-medium text-xs"
                >
                  {business.category}
                </Badge>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 
                  className="font-bold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  onClick={handleImageClick}
                >
                  {business.name}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(business.rating)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {business.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({business.reviews} reviews)
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.location}, {business.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Est. {business.established}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {business.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  {Object.entries(business.socialLinks).slice(0, 3).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="p-2 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                      onClick={() => window.open(url, '_blank')}
                    >
                      {getSocialIcon(platform)}
                    </Button>
                  ))}
                </div>
                
                <Button 
                  variant="default"
                  size="sm"
                  onClick={handleImageClick}
                  className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border border-gray-200 rounded-xl">
      <div className="relative overflow-hidden">
        <img
          src={business.image}
          alt={business.name}
          className="w-full h-48 object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
          onClick={handleImageClick}
        />
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className="bg-white/90 text-gray-700 backdrop-blur-sm font-medium"
          >
            {business.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 
            className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={handleImageClick}
          >
            {business.name}
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(business.rating)}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {business.rating}
            </span>
            <span className="text-sm text-gray-500">
              ({business.reviews} reviews)
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{business.location}, {business.city}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Est. {business.established}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {business.description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            {Object.entries(business.socialLinks).map(([platform, url]) => (
              <Button
                key={platform}
                variant="outline"
                size="sm"
                className="p-2 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                onClick={() => window.open(url, '_blank')}
              >
                {getSocialIcon(platform)}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="default"
            size="sm"
            onClick={handleImageClick}
            className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;