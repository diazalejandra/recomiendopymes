# Backend Integration Contracts

## Current Frontend Mock Data (to be replaced)
- **File**: `/frontend/src/mock.js`
- **Mock Data**: 8 businesses with complete business information
- **Mock Reviews**: Static review data in BusinessDetail component
- **Mock Categories**: 7 categories including 'All'
- **Mock Cities**: 8 cities including 'All Cities'

## Database Models Required

### 1. Business Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  category: String (required),
  description: String (required),
  rating: Number (calculated from reviews),
  reviewCount: Number (calculated from reviews),
  image: String (URL),
  gallery: [String] (array of image URLs),
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
    github: String,
    youtube: String,
    website: String,
    etsy: String,
    pinterest: String
  },
  owner: String (required),
  location: String (required), // District/Area
  city: String (required),
  established: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Review Model
```javascript
{
  _id: ObjectId,
  businessId: ObjectId (ref: Business),
  rating: Number (1-5, required),
  text: String (required),
  reviewer: String (required),
  date: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Category Model (Optional - can be dynamic)
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  createdAt: Date
}
```

## API Endpoints Required

### Business Endpoints
- `GET /api/businesses` - Get all businesses with filtering and sorting
  - Query params: `?category=string&city=string&search=string&page=number&limit=number`
  - Returns: `{ businesses: [], total: number, page: number, totalPages: number }`
  - Default sorting: by rating (highest first)

- `GET /api/businesses/:id` - Get single business with reviews
  - Returns: `{ business: {}, reviews: [] }`

- `POST /api/businesses` - Create new business (admin)
- `PUT /api/businesses/:id` - Update business (admin)
- `DELETE /api/businesses/:id` - Delete business (admin)

### Review Endpoints
- `POST /api/businesses/:businessId/reviews` - Submit new review
  - Body: `{ rating: number, text: string, reviewer: string }`
  - Returns: `{ review: {}, message: string }`
  - Updates business rating automatically

- `GET /api/businesses/:businessId/reviews` - Get reviews for business
  - Query params: `?page=number&limit=number`
  - Returns: `{ reviews: [], total: number }`

### Category & City Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/cities` - Get all cities (dynamically from businesses)

## Frontend Integration Points

### 1. HomePage Component (`/frontend/src/components/HomePage.jsx`)
**Replace mock data with API calls:**
- Line ~8: Remove `import { mockBusinesses, categories, cities } from '../mock';`
- Add API calls to fetch businesses, categories, cities
- Implement pagination for businesses
- Add loading states and error handling

### 2. BusinessDetail Component (`/frontend/src/components/BusinessDetail.jsx`)
**Replace mock data with API calls:**
- Line ~11: Remove `import { mockBusinesses } from '../mock';`
- Fetch single business data: `GET /api/businesses/:id`
- Fetch business reviews: `GET /api/businesses/:id/reviews`
- Handle review submission to backend API

### 3. ReviewForm Component (`/frontend/src/components/ReviewForm.jsx`)
**Replace mock submission with real API:**
- Line ~45: Replace mock API call with real endpoint
- Submit to: `POST /api/businesses/:businessId/reviews`
- Handle success/error responses
- Refresh parent component data after successful submission

## Data Migration Strategy
1. Create seed script to populate database with current mock data
2. Test all endpoints with seeded data
3. Update frontend components one by one
4. Remove mock.js file after successful integration

## Technical Requirements
- **Error Handling**: Consistent error responses across all endpoints
- **Validation**: Input validation using Pydantic models
- **CORS**: Already configured for frontend requests
- **Database**: MongoDB with proper indexing for search/filter operations
- **Performance**: Implement pagination for large datasets

## Rating Calculation Logic
```javascript
// When new review is submitted:
1. Save review to database
2. Recalculate business rating: average of all reviews
3. Update business.rating and business.reviewCount
4. Return updated business data
```

## Search Implementation
- Search across: business.name, business.description, business.category, business.city
- Case-insensitive partial matching
- Use MongoDB text indexing for better performance

## Frontend State Management
- Add loading states for all API calls
- Implement error boundaries for API failures  
- Add retry mechanisms for failed requests
- Cache categories and cities data (they change rarely)

This contracts file ensures seamless backend integration while maintaining all current frontend functionality.