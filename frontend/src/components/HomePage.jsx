import React, { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Filter, Grid, List, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import BusinessCard from './BusinessCard';
import { businessAPI, metaAPI, handleApiError } from '../utils/api';
import { useToast } from '../hooks/use-toast';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [viewMode, setViewMode] = useState('grid');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);

  const filteredBusinesses = useMemo(() => {
    return mockBusinesses
      .filter(business => {
        const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            business.city.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
        const matchesCity = selectedCity === 'All Cities' || business.city === selectedCity;
        
        return matchesSearch && matchesCategory && matchesCity;
      })
      .sort((a, b) => b.rating - a.rating); // Sort by rating (best first)
  }, [searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Entrepreneur <span className="text-blue-600">Catalog</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing local businesses and connect with passionate entrepreneurs in your community
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search businesses, categories, cities, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Category Filter */}
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    {categories.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="text-blue-600 hover:text-blue-700 px-2 py-1 h-auto"
                      >
                        {showAllCategories ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show All ({categories.length - 3} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllCategories ? categories : categories.slice(0, 4)).map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'hover:bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Filter */}
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">City:</span>
                    {cities.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllCities(!showAllCities)}
                        className="text-green-600 hover:text-green-700 px-2 py-1 h-auto"
                      >
                        {showAllCities ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show All ({cities.length - 2} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllCities ? cities : cities.slice(0, 3)).map((city) => (
                      <Badge
                        key={city}
                        variant={selectedCity === city ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 transition-all duration-200 ${
                          selectedCity === city
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'hover:bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                        onClick={() => setSelectedCity(city)}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex justify-end">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Found <span className="font-semibold text-gray-900">{filteredBusinesses.length}</span> businesses
            {selectedCategory !== 'All' && (
              <span> in <span className="font-semibold text-blue-600">{selectedCategory}</span></span>
            )}
            {selectedCity !== 'All Cities' && (
              <span> in <span className="font-semibold text-green-600">{selectedCity}</span></span>
            )}
          </p>
        </div>

        {/* Business Grid/List */}
        {filteredBusinesses.length > 0 ? (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className={viewMode === 'grid' ? "transform hover:scale-102 transition-transform duration-200" : ""}
              >
                <BusinessCard business={business} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filter
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedCity('All Cities');
              }}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Are you an entrepreneur looking to showcase your business? Get featured in our catalog and connect with potential customers.
            </p>
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors duration-200"
            >
              List Your Business
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;