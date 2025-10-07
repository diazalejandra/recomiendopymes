import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Business API functions
export const businessAPI = {
  // Get all businesses with filtering and pagination
  getBusinesses: async (params = {}) => {
    const response = await apiClient.get('/businesses', { params });
    return response.data;
  },

  // Get single business with reviews
  getBusinessById: async (businessId) => {
    const response = await apiClient.get(`/businesses/${businessId}`);
    return response.data;
  },

  // Create new business (admin function)
  createBusiness: async (businessData) => {
    const response = await apiClient.post('/businesses', businessData);
    return response.data;
  },

  // Update business (admin function)
  updateBusiness: async (businessId, businessData) => {
    const response = await apiClient.put(`/businesses/${businessId}`, businessData);
    return response.data;
  },

  // Delete business (admin function)
  deleteBusiness: async (businessId) => {
    const response = await apiClient.delete(`/businesses/${businessId}`);
    return response.data;
  },
};

// Review API functions
export const reviewAPI = {
  // Get reviews for a specific business
  getBusinessReviews: async (businessId, params = {}) => {
    const response = await apiClient.get(`/businesses/${businessId}/reviews`, { params });
    return response.data;
  },

  // Submit new review
  createReview: async (businessId, reviewData) => {
    const response = await apiClient.post(`/businesses/${businessId}/reviews`, reviewData);
    return response.data;
  },
};

// Category and City API functions
export const metaAPI = {
  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  },

  // Get all cities
  getCities: async () => {
    const response = await apiClient.get('/cities');
    return response.data.cities;
  },
};

// Error handling utility
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.detail || error.response.data?.message || defaultMessage;
    return {
      message,
      status: error.response.status,
      type: 'api_error'
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'Network error. Please check your internet connection.',
      type: 'network_error'
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || defaultMessage,
      type: 'unknown_error'
    };
  }
};

export default apiClient;