import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowLeft, Shield, AlertTriangle, Mail, Clock } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost"
            className="hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Entrepreneur Catalog Platform Agreement
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Introduction */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h3>
              <p className="text-gray-700 leading-relaxed">
                Welcome to our Entrepreneur Catalog platform. By listing your business with us or using our services, 
                you agree to these terms and conditions. Our platform connects entrepreneurs with potential customers 
                by showcasing business information and facilitating reviews.
              </p>
            </div>

            <Separator />

            {/* Free Service */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>2. Free Service</span>
                <Shield className="w-5 h-5 text-green-600" />
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Lifetime Free Listing:</strong> Our business listing service is completely free for life. 
                  There are no subscription fees, hidden costs, or premium charges.
                </p>
                <p className="leading-relaxed">
                  <strong>No Payment Required:</strong> You will never be asked to provide payment information 
                  or pay any fees to maintain your business listing on our platform.
                </p>
              </div>
            </div>

            <Separator />

            {/* Monthly Renewal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>3. Monthly Profile Renewal</span>
                <Clock className="w-5 h-5 text-blue-600" />
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Monthly Email Reminders:</strong> To keep business information current and accurate, 
                  we send monthly email reminders to all listed businesses.
                </p>
                <p className="leading-relaxed">
                  <strong>Profile Activation:</strong> You must respond to these monthly emails to keep your 
                  business profile active and visible in our catalog.
                </p>
                <p className="leading-relaxed">
                  <strong>Inactive Profiles:</strong> Failure to respond to renewal emails may result in your 
                  business profile being temporarily hidden from public view until reactivation.
                </p>
              </div>
            </div>

            <Separator />

            {/* Information Responsibility */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>4. Information Responsibility</span>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Accuracy:</strong> You are solely responsible for providing accurate, current, 
                  and complete information about your business.
                </p>
                <p className="leading-relaxed">
                  <strong>Updates:</strong> You must promptly update your business information when changes occur, 
                  including but not limited to contact details, services, pricing, and business hours.
                </p>
                <p className="leading-relaxed">
                  <strong>Verification:</strong> We reserve the right to verify submitted information but are 
                  not obligated to do so.
                </p>
              </div>
            </div>

            <Separator />

            {/* Platform Disclaimer */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Platform Disclaimer</h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>No Direct Relationship:</strong> We have no direct business relationship with the 
                  entrepreneurs and businesses listed on our platform. We serve only as a directory service.
                </p>
                <p className="leading-relaxed">
                  <strong>Business Operations:</strong> We are not responsible for the business operations, 
                  service quality, products, or any transactions between businesses and their customers.
                </p>
                <p className="leading-relaxed">
                  <strong>Customer Disputes:</strong> Any disputes between customers and businesses must be 
                  resolved directly between the parties involved.
                </p>
              </div>
            </div>

            <Separator />

            {/* Reviews and Ratings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Reviews and Ratings</h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Customer Reviews:</strong> Our platform allows customers to leave reviews and ratings 
                  for businesses. These reviews represent the opinions of individual customers.
                </p>
                <p className="leading-relaxed">
                  <strong>Review Authenticity:</strong> While we encourage honest reviews, we cannot guarantee 
                  the authenticity or accuracy of all customer reviews.
                </p>
                <p className="leading-relaxed">
                  <strong>Review Management:</strong> We reserve the right to remove reviews that violate our 
                  community guidelines or appear to be fraudulent.
                </p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>7. Contact & Communication</span>
                <Mail className="w-5 h-5 text-purple-600" />
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Email Communication:</strong> By listing your business, you consent to receive 
                  monthly renewal emails and important platform updates.
                </p>
                <p className="leading-relaxed">
                  <strong>Unsubscribe:</strong> You may unsubscribe from our emails at any time, but this 
                  will result in your business profile being removed from our catalog.
                </p>
                <p className="leading-relaxed">
                  <strong>Contact Changes:</strong> You must notify us immediately of any changes to your 
                  contact email address.
                </p>
              </div>
            </div>

            <Separator />

            {/* Liability */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Service Basis:</strong> Our platform is provided "as is" without any warranties 
                  or guarantees of specific outcomes.
                </p>
                <p className="leading-relaxed">
                  <strong>Business Results:</strong> We make no guarantees about the number of customers, 
                  sales, or business growth that may result from being listed on our platform.
                </p>
                <p className="leading-relaxed">
                  <strong>Damages:</strong> We are not liable for any direct, indirect, or consequential 
                  damages arising from the use of our platform.
                </p>
              </div>
            </div>

            <Separator />

            {/* Changes to Terms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Updates:</strong> We may update these terms and conditions from time to time. 
                  Changes will be posted on this page with an updated date.
                </p>
                <p className="leading-relaxed">
                  <strong>Notification:</strong> Significant changes will be communicated via email to 
                  all listed businesses.
                </p>
                <p className="leading-relaxed">
                  <strong>Continued Use:</strong> Continued use of our platform after changes constitutes 
                  acceptance of the updated terms.
                </p>
              </div>
            </div>

            <Separator />

            {/* Agreement */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
              <h4 className="font-semibold text-gray-900 mb-3">Agreement</h4>
              <p className="text-gray-700 leading-relaxed">
                By submitting your business information to our platform, you acknowledge that you have read, 
                understood, and agree to be bound by these terms and conditions. If you do not agree with 
                any part of these terms, please do not use our platform.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <Button 
                onClick={() => navigate('/list-business')}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                I Agree - List My Business
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
                Back to Catalog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;