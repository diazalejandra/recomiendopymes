import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Building, 
  Camera, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Send,
  CheckCircle,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import TikTokIcon from './icons/TikTokIcon';
import { useToast } from '../hooks/use-toast';

const ListBusinessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    owner: '',
    location: '',
    city: '',
    established: '',
    email: '',
    image: '',
    gallery: ['', '', ''],
    socialLinks: {
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      twitter: '',
      youtube: ''
    }
  });

  const categories = [
    'Food & Beverage',
    'Arts & Crafts',
    'Home & Garden',
    'Technology',
    'Fashion',
    'Health & Wellness',
    'Beauty & Personal Care',
    'Professional Services',
    'Retail',
    'Entertainment',
    'Education',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else if (field.startsWith('gallery.')) {
      const index = parseInt(field.split('.')[1]);
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.map((url, i) => i === index ? value : url)
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.category || !formData.description || !formData.owner || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call for business submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted! 🎉",
        description: "Thank you for joining our entrepreneur catalog. We'll review your application and contact you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        description: '',
        owner: '',
        location: '',
        city: '',
        established: '',
        email: '',
        image: '',
        gallery: ['', '', ''],
        socialLinks: {
          website: '',
          instagram: '',
          facebook: '',
          tiktok: '',
          twitter: '',
          youtube: ''
        }
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">List Your Business</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join our entrepreneur catalog and showcase your business to potential customers. 
            It's completely free for life!
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center p-4">
              <Users className="w-12 h-12 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Reach New Customers</h3>
              <p className="text-gray-600 text-sm">Connect with potential customers searching for your services</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <TrendingUp className="w-12 h-12 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Grow Your Business</h3>
              <p className="text-gray-600 text-sm">Increase visibility and build your brand presence online</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <CheckCircle className="w-12 h-12 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Lifetime Free</h3>
              <p className="text-gray-600 text-sm">No subscription fees, no hidden costs - completely free forever</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Star className="w-6 h-6 text-yellow-500" />
              <span>Business Application</span>
            </CardTitle>
            <p className="text-gray-600">
              Fill out the form below to get your business featured in our catalog.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your business name"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="owner" className="text-base font-medium">Owner Name *</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => handleInputChange('owner', e.target.value)}
                      placeholder="Enter owner's full name"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-base font-medium">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="established" className="text-base font-medium">Year Established</Label>
                    <Input
                      id="established"
                      value={formData.established}
                      onChange={(e) => handleInputChange('established', e.target.value)}
                      placeholder="2020"
                      className="mt-1"
                      maxLength="4"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium">Business Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business, services, and what makes you unique..."
                    className="mt-1 min-h-[100px]"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-base font-medium">Address/District</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Downtown District, Main Street, etc."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city" className="text-base font-medium">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="San Francisco"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                
                <div>
                  <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">We'll use this to send monthly profile renewal reminders</p>
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                
                <div>
                  <Label htmlFor="image" className="text-base font-medium">Main Business Image</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/your-business-photo.jpg"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">URL to your main business photo</p>
                </div>

                <div>
                  <Label className="text-base font-medium">Gallery Images (Optional)</Label>
                  <div className="space-y-2 mt-1">
                    {formData.gallery.map((url, index) => (
                      <Input
                        key={index}
                        value={url}
                        onChange={(e) => handleInputChange(`gallery.${index}`, e.target.value)}
                        placeholder={`Gallery image ${index + 1} URL`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Social Media */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Social Media & Website</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.website}
                      onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                      placeholder="https://instagram.com/yourbusiness"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.facebook}
                      onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                      placeholder="https://facebook.com/yourbusiness"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>TikTok</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.tiktok}
                      onChange={(e) => handleInputChange('socialLinks.tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@yourbusiness"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                      placeholder="https://twitter.com/yourbusiness"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Youtube className="w-4 h-4" />
                      <span>YouTube</span>
                    </Label>
                    <Input
                      value={formData.socialLinks.youtube}
                      onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                      placeholder="https://youtube.com/@yourbusiness"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms Agreement */}
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>Lifetime Free:</strong> No subscription fees or hidden costs - completely free forever</p>
                  <p>• <strong>Monthly Renewal:</strong> We'll send you a monthly email to keep your profile active</p>
                  <p>• <strong>Information Accuracy:</strong> You're responsible for providing accurate business information</p>
                  <p>• <strong>No Direct Relationship:</strong> We are not affiliated with your business operations</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/terms')}
                  type="button"
                >
                  Read Full Terms & Conditions
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Application</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListBusinessPage;