import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Star, Send, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ReviewForm = ({ businessName, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !reviewText.trim() || !reviewerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and provide a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newReview = {
        id: Date.now().toString(),
        rating,
        text: reviewText,
        reviewer: reviewerName,
        date: new Date().toLocaleDateString(),
        businessName
      };
      
      onReviewSubmit(newReview);
      
      // Reset form
      setRating(0);
      setReviewText('');
      setReviewerName('');
      
      toast({
        title: "Review Submitted! 🌟",
        description: "Thank you for your feedback! Your review will help other customers.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`transition-all duration-200 transform hover:scale-110 ${
            i <= displayRating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'
          }`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <Star 
            className={`w-8 h-8 ${
              i <= displayRating ? 'fill-amber-400' : 'fill-transparent'
            }`} 
          />
        </button>
      );
    }
    
    return stars;
  };

  const getRatingText = () => {
    const currentRating = hoverRating || rating;
    switch (currentRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Card className="border-gray-200 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Star className="w-6 h-6 text-amber-400" />
          <span>Write a Review for {businessName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Your Rating
            </Label>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {renderStars()}
              </div>
              <span className="text-lg font-medium text-gray-700 ml-4">
                {getRatingText()}
              </span>
            </div>
          </div>

          {/* Reviewer Name */}
          <div className="space-y-2">
            <Label htmlFor="reviewer-name" className="text-base font-semibold text-gray-900">
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="reviewer-name"
                type="text"
                placeholder="Enter your name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="pl-10 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-base font-semibold text-gray-900">
              Your Review
            </Label>
            <Textarea
              id="review-text"
              placeholder="Share your experience with this business. What did you like? What could be improved?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
              disabled={isSubmitting}
            />
            <div className="text-sm text-gray-500 text-right">
              {reviewText.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!rating || !reviewText.trim() || !reviewerName.trim() || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Review...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Submit Review</span>
              </div>
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Your honest review helps other customers make informed decisions and helps businesses improve their services.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;