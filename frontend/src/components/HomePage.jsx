import React, { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Filter, Grid, List, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import BusinessCard from './BusinessCard';
import { businessAPI, metaAPI, handleApiError } from '../utils/api';
import { useToast } from '../hooks/use-toast';
import { useWindowSize, getFilterLimits } from '../hooks/useWindowSize';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [viewMode, setViewMode] = useState('grid');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  
  // API data state
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [cities, setCities] = useState(['All Cities']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const { toast } = useToast();
  const { width } = useWindowSize();
  const filterLimits = getFilterLimits(width);

  // Fetch categories and cities on component mount
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          metaAPI.getCategories(),
          metaAPI.getCities()
        ]);
        setCategories(categoriesData);
        setCities(citiesData);
      } catch (error) {
        const errorInfo = handleApiError(error, 'Failed to load categories and cities');
        toast({
          title: "Error",
          description: errorInfo.message,
          variant: "destructive",
        });
      }
    };
    
    fetchMetaData();
  }, [toast]);

  // Fetch businesses when filters change
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: currentPage,
          limit: 12,
        };
        
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        
        if (selectedCity !== 'All Cities') {
          params.city = selectedCity;
        }
        
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        const response = await businessAPI.getBusinesses(params);
        setBusinesses(response.businesses);
        setTotalResults(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        const errorInfo = handleApiError(error, 'Failed to load businesses');
        setError(errorInfo.message);
        toast({
          title: "Error",
          description: errorInfo.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(fetchBusinesses, searchTerm ? 500 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedCity, currentPage, toast]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
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
                    {categories.length > (window.innerWidth < 768 ? 3 : window.innerWidth < 1024 ? 5 : 7) && (
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
                            Show All ({categories.length - (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 6)} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllCategories ? categories : categories.slice(0, window.innerWidth < 768 ? 3 : window.innerWidth < 1024 ? 5 : 7)).map((category) => (
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
                    {cities.length > (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 6) && (
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
                            Show All ({cities.length - (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 3 : 5)} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllCities ? cities : cities.slice(0, window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 6)).map((city) => (
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
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 text-lg">
            Found <span className="font-semibold text-gray-900">{totalResults}</span> businesses
            {selectedCategory !== 'All' && (
              <span> in <span className="font-semibold text-blue-600">{selectedCategory}</span></span>
            )}
            {selectedCity !== 'All Cities' && (
              <span> in <span className="font-semibold text-green-600">{selectedCity}</span></span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading businesses...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Business Grid/List */}
        {!loading && !error && businesses.length > 0 && (
          <>
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }`}>
              {businesses.map((business) => (
                <div
                  key={business._id}
                  className={viewMode === 'grid' ? "transform hover:scale-102 transition-transform duration-200" : ""}
                >
                  <BusinessCard business={business} viewMode={viewMode} />
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && !error && businesses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters
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