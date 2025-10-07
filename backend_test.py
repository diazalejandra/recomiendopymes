#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Entrepreneur Catalog
Tests all endpoints with various scenarios including edge cases
"""

import requests
import json
import sys
from typing import Dict, Any, List
import time

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_BASE}")

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.business_ids = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            return None
            
    def test_health_check(self):
        """Test basic API health"""
        print("\n🔍 Testing API Health Check...")
        response = self.make_request("GET", "/")
        
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data and "status" in data:
                self.log_test("API Health Check", True, f"Status: {data.get('status')}")
                return True
            else:
                self.log_test("API Health Check", False, "Invalid response format")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("API Health Check", False, f"Status code: {status_code}")
        return False
        
    def test_get_all_businesses(self):
        """Test GET /api/businesses without parameters"""
        print("\n🔍 Testing GET /api/businesses (all businesses)...")
        response = self.make_request("GET", "/businesses")
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                required_fields = ["businesses", "total", "page", "total_pages"]
                
                if all(field in data for field in required_fields):
                    businesses = data["businesses"]
                    if isinstance(businesses, list) and len(businesses) > 0:
                        # Store business IDs for later tests
                        self.business_ids = [b["_id"] for b in businesses if "_id" in b]
                        
                        # Check if businesses are sorted by rating (descending)
                        ratings = [b.get("rating", 0) for b in businesses]
                        is_sorted = all(ratings[i] >= ratings[i+1] for i in range(len(ratings)-1))
                        
                        self.log_test("Get All Businesses", True, 
                                    f"Found {len(businesses)} businesses, sorted by rating: {is_sorted}")
                        return True
                    else:
                        self.log_test("Get All Businesses", False, "No businesses found or invalid format")
                else:
                    self.log_test("Get All Businesses", False, f"Missing required fields: {required_fields}")
            except json.JSONDecodeError:
                self.log_test("Get All Businesses", False, "Invalid JSON response")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get All Businesses", False, f"Status code: {status_code}")
        return False
        
    def test_category_filter(self):
        """Test GET /api/businesses with category filter"""
        print("\n🔍 Testing Category Filter...")
        
        # First get categories to test with
        categories_response = self.make_request("GET", "/categories")
        if not categories_response or categories_response.status_code != 200:
            self.log_test("Category Filter", False, "Could not get categories")
            return False
            
        categories_data = categories_response.json()
        categories = categories_data.get("categories", [])
        
        # Test with a specific category (skip "All")
        test_categories = [cat for cat in categories if cat not in ["All"]]
        if not test_categories:
            self.log_test("Category Filter", False, "No categories available for testing")
            return False
            
        test_category = test_categories[0]
        response = self.make_request("GET", f"/businesses?category={test_category}")
        
        if response and response.status_code == 200:
            data = response.json()
            businesses = data.get("businesses", [])
            
            # Check if all businesses have the correct category
            if businesses:
                correct_category = all(b.get("category") == test_category for b in businesses)
                self.log_test("Category Filter", correct_category, 
                            f"Tested category '{test_category}', found {len(businesses)} businesses")
                return correct_category
            else:
                self.log_test("Category Filter", True, f"No businesses found for category '{test_category}' (valid)")
                return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Category Filter", False, f"Status code: {status_code}")
        return False
        
    def test_city_filter(self):
        """Test GET /api/businesses with city filter"""
        print("\n🔍 Testing City Filter...")
        
        # First get cities to test with
        cities_response = self.make_request("GET", "/cities")
        if not cities_response or cities_response.status_code != 200:
            self.log_test("City Filter", False, "Could not get cities")
            return False
            
        cities_data = cities_response.json()
        cities = cities_data.get("cities", [])
        
        # Test with a specific city (skip "All Cities")
        test_cities = [city for city in cities if city not in ["All Cities"]]
        if not test_cities:
            self.log_test("City Filter", False, "No cities available for testing")
            return False
            
        test_city = test_cities[0]
        response = self.make_request("GET", f"/businesses?city={test_city}")
        
        if response and response.status_code == 200:
            data = response.json()
            businesses = data.get("businesses", [])
            
            # Check if all businesses have the correct city
            if businesses:
                correct_city = all(b.get("city") == test_city for b in businesses)
                self.log_test("City Filter", correct_city, 
                            f"Tested city '{test_city}', found {len(businesses)} businesses")
                return correct_city
            else:
                self.log_test("City Filter", True, f"No businesses found for city '{test_city}' (valid)")
                return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("City Filter", False, f"Status code: {status_code}")
        return False
        
    def test_search_functionality(self):
        """Test GET /api/businesses with search parameter"""
        print("\n🔍 Testing Search Functionality...")
        
        # Test search with common term
        search_term = "coffee"
        response = self.make_request("GET", f"/businesses?search={search_term}")
        
        if response and response.status_code == 200:
            data = response.json()
            businesses = data.get("businesses", [])
            
            # Check if search results contain the search term in relevant fields
            if businesses:
                search_found = any(
                    search_term.lower() in str(b.get("name", "")).lower() or
                    search_term.lower() in str(b.get("description", "")).lower() or
                    search_term.lower() in str(b.get("category", "")).lower()
                    for b in businesses
                )
                self.log_test("Search Functionality", search_found, 
                            f"Searched for '{search_term}', found {len(businesses)} results")
                return search_found
            else:
                self.log_test("Search Functionality", True, f"No results for '{search_term}' (valid)")
                return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Search Functionality", False, f"Status code: {status_code}")
        return False
        
    def test_pagination(self):
        """Test GET /api/businesses with pagination"""
        print("\n🔍 Testing Pagination...")
        
        # Test with specific page and limit
        response = self.make_request("GET", "/businesses?page=1&limit=3")
        
        if response and response.status_code == 200:
            data = response.json()
            businesses = data.get("businesses", [])
            page = data.get("page")
            total_pages = data.get("total_pages")
            
            if len(businesses) <= 3 and page == 1 and isinstance(total_pages, int):
                self.log_test("Pagination", True, 
                            f"Page 1 with limit 3: got {len(businesses)} businesses, {total_pages} total pages")
                return True
            else:
                self.log_test("Pagination", False, 
                            f"Invalid pagination: got {len(businesses)} businesses, page {page}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Pagination", False, f"Status code: {status_code}")
        return False
        
    def test_combined_filters(self):
        """Test GET /api/businesses with multiple filters"""
        print("\n🔍 Testing Combined Filters...")
        
        # Get available categories and cities first
        categories_response = self.make_request("GET", "/categories")
        cities_response = self.make_request("GET", "/cities")
        
        if not (categories_response and cities_response and 
                categories_response.status_code == 200 and cities_response.status_code == 200):
            self.log_test("Combined Filters", False, "Could not get categories or cities")
            return False
            
        categories = [c for c in categories_response.json().get("categories", []) if c != "All"]
        cities = [c for c in cities_response.json().get("cities", []) if c != "All Cities"]
        
        if not categories or not cities:
            self.log_test("Combined Filters", False, "No categories or cities available")
            return False
            
        # Test with combined filters
        test_category = categories[0]
        test_city = cities[0]
        response = self.make_request("GET", 
                                   f"/businesses?category={test_category}&city={test_city}&page=1&limit=5")
        
        if response and response.status_code == 200:
            data = response.json()
            businesses = data.get("businesses", [])
            
            # Verify filters are applied correctly
            if businesses:
                correct_filters = all(
                    b.get("category") == test_category and b.get("city") == test_city
                    for b in businesses
                )
                self.log_test("Combined Filters", correct_filters, 
                            f"Category: {test_category}, City: {test_city}, Results: {len(businesses)}")
                return correct_filters
            else:
                self.log_test("Combined Filters", True, "No results for combined filters (valid)")
                return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Combined Filters", False, f"Status code: {status_code}")
        return False
        
    def test_get_business_detail_valid(self):
        """Test GET /api/businesses/{business_id} with valid ID"""
        print("\n🔍 Testing Get Business Detail (Valid ID)...")
        
        if not self.business_ids:
            self.log_test("Get Business Detail (Valid)", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        response = self.make_request("GET", f"/businesses/{business_id}")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if "business" in data and "reviews" in data:
                business = data["business"]
                reviews = data["reviews"]
                
                if business.get("id") == business_id and isinstance(reviews, list):
                    self.log_test("Get Business Detail (Valid)", True, 
                                f"Got business details with {len(reviews)} reviews")
                    return True
                else:
                    self.log_test("Get Business Detail (Valid)", False, "Invalid business data structure")
            else:
                self.log_test("Get Business Detail (Valid)", False, "Missing business or reviews fields")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Business Detail (Valid)", False, f"Status code: {status_code}")
        return False
        
    def test_get_business_detail_invalid(self):
        """Test GET /api/businesses/{business_id} with invalid ID"""
        print("\n🔍 Testing Get Business Detail (Invalid ID)...")
        
        invalid_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
        response = self.make_request("GET", f"/businesses/{invalid_id}")
        
        if response and response.status_code == 404:
            self.log_test("Get Business Detail (Invalid)", True, "Correctly returned 404 for invalid ID")
            return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Business Detail (Invalid)", False, f"Expected 404, got {status_code}")
        return False
        
    def test_create_review_valid(self):
        """Test POST /api/businesses/{business_id}/reviews with valid data"""
        print("\n🔍 Testing Create Review (Valid Data)...")
        
        if not self.business_ids:
            self.log_test("Create Review (Valid)", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        review_data = {
            "rating": 4,
            "text": "Great service and excellent quality! I really enjoyed my experience here and would definitely recommend it to others.",
            "reviewer": "Sarah Johnson"
        }
        
        response = self.make_request("POST", f"/businesses/{business_id}/reviews", 
                                   json=review_data)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if (data.get("rating") == review_data["rating"] and 
                data.get("text") == review_data["text"] and
                data.get("reviewer") == review_data["reviewer"]):
                self.log_test("Create Review (Valid)", True, "Review created successfully")
                return True
            else:
                self.log_test("Create Review (Valid)", False, "Review data mismatch")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Review (Valid)", False, f"Status code: {status_code}")
        return False
        
    def test_create_review_invalid_business(self):
        """Test POST /api/businesses/{business_id}/reviews with invalid business ID"""
        print("\n🔍 Testing Create Review (Invalid Business ID)...")
        
        invalid_id = "507f1f77bcf86cd799439011"
        review_data = {
            "rating": 5,
            "text": "This is a test review for an invalid business ID.",
            "reviewer": "Test User"
        }
        
        response = self.make_request("POST", f"/businesses/{invalid_id}/reviews", 
                                   json=review_data)
        
        if response and response.status_code == 404:
            self.log_test("Create Review (Invalid Business)", True, "Correctly returned 404")
            return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Review (Invalid Business)", False, f"Expected 404, got {status_code}")
        return False
        
    def test_create_review_invalid_data(self):
        """Test POST /api/businesses/{business_id}/reviews with invalid data"""
        print("\n🔍 Testing Create Review (Invalid Data)...")
        
        if not self.business_ids:
            self.log_test("Create Review (Invalid Data)", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        
        # Test with invalid rating (out of range)
        invalid_review = {
            "rating": 6,  # Invalid: should be 1-5
            "text": "This review has an invalid rating.",
            "reviewer": "Test User"
        }
        
        response = self.make_request("POST", f"/businesses/{business_id}/reviews", 
                                   json=invalid_review)
        
        if response and response.status_code == 422:  # Validation error
            self.log_test("Create Review (Invalid Data)", True, "Correctly rejected invalid rating")
            return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Review (Invalid Data)", False, f"Expected 422, got {status_code}")
        return False
        
    def test_get_business_reviews(self):
        """Test GET /api/businesses/{business_id}/reviews"""
        print("\n🔍 Testing Get Business Reviews...")
        
        if not self.business_ids:
            self.log_test("Get Business Reviews", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        response = self.make_request("GET", f"/businesses/{business_id}/reviews")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if "reviews" in data and "total" in data:
                reviews = data["reviews"]
                total = data["total"]
                
                if isinstance(reviews, list) and isinstance(total, int):
                    self.log_test("Get Business Reviews", True, 
                                f"Got {len(reviews)} reviews, total: {total}")
                    return True
                else:
                    self.log_test("Get Business Reviews", False, "Invalid data types")
            else:
                self.log_test("Get Business Reviews", False, "Missing required fields")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Business Reviews", False, f"Status code: {status_code}")
        return False
        
    def test_get_business_reviews_pagination(self):
        """Test GET /api/businesses/{business_id}/reviews with pagination"""
        print("\n🔍 Testing Get Business Reviews Pagination...")
        
        if not self.business_ids:
            self.log_test("Get Business Reviews Pagination", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        response = self.make_request("GET", f"/businesses/{business_id}/reviews?page=1&limit=5")
        
        if response and response.status_code == 200:
            data = response.json()
            reviews = data.get("reviews", [])
            
            if len(reviews) <= 5:
                self.log_test("Get Business Reviews Pagination", True, 
                            f"Pagination working: got {len(reviews)} reviews (limit 5)")
                return True
            else:
                self.log_test("Get Business Reviews Pagination", False, 
                            f"Pagination failed: got {len(reviews)} reviews (expected ≤5)")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Business Reviews Pagination", False, f"Status code: {status_code}")
        return False
        
    def test_get_categories(self):
        """Test GET /api/categories"""
        print("\n🔍 Testing Get Categories...")
        
        response = self.make_request("GET", "/categories")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if "categories" in data:
                categories = data["categories"]
                
                if isinstance(categories, list) and len(categories) > 0:
                    self.log_test("Get Categories", True, f"Got {len(categories)} categories")
                    return True
                else:
                    self.log_test("Get Categories", False, "No categories found")
            else:
                self.log_test("Get Categories", False, "Missing categories field")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Categories", False, f"Status code: {status_code}")
        return False
        
    def test_get_cities(self):
        """Test GET /api/cities"""
        print("\n🔍 Testing Get Cities...")
        
        response = self.make_request("GET", "/cities")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if "cities" in data:
                cities = data["cities"]
                
                if isinstance(cities, list) and len(cities) > 0:
                    self.log_test("Get Cities", True, f"Got {len(cities)} cities")
                    return True
                else:
                    self.log_test("Get Cities", False, "No cities found")
            else:
                self.log_test("Get Cities", False, "Missing cities field")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Cities", False, f"Status code: {status_code}")
        return False
        
    def test_rating_calculation_update(self):
        """Test that business rating updates when new reviews are added"""
        print("\n🔍 Testing Rating Calculation Update...")
        
        if not self.business_ids:
            self.log_test("Rating Calculation Update", False, "No business IDs available")
            return False
            
        business_id = self.business_ids[0]
        
        # Get initial business rating
        initial_response = self.make_request("GET", f"/businesses/{business_id}")
        if not initial_response or initial_response.status_code != 200:
            self.log_test("Rating Calculation Update", False, "Could not get initial business data")
            return False
            
        initial_data = initial_response.json()
        initial_rating = initial_data["business"].get("rating", 0)
        initial_review_count = initial_data["business"].get("reviews", 0)
        
        # Add a new review
        review_data = {
            "rating": 5,
            "text": "Excellent service! This is a test review to check rating calculation updates.",
            "reviewer": "Rating Test User"
        }
        
        review_response = self.make_request("POST", f"/businesses/{business_id}/reviews", 
                                          json=review_data)
        
        if not review_response or review_response.status_code != 200:
            self.log_test("Rating Calculation Update", False, "Could not create test review")
            return False
            
        # Wait a moment for the rating to update
        time.sleep(1)
        
        # Get updated business rating
        updated_response = self.make_request("GET", f"/businesses/{business_id}")
        if not updated_response or updated_response.status_code != 200:
            self.log_test("Rating Calculation Update", False, "Could not get updated business data")
            return False
            
        updated_data = updated_response.json()
        updated_rating = updated_data["business"].get("rating", 0)
        updated_review_count = updated_data["business"].get("reviews", 0)
        
        # Check if rating and review count were updated
        rating_updated = updated_rating != initial_rating or initial_review_count == 0
        count_updated = updated_review_count == initial_review_count + 1
        
        if rating_updated and count_updated:
            self.log_test("Rating Calculation Update", True, 
                        f"Rating: {initial_rating} → {updated_rating}, Reviews: {initial_review_count} → {updated_review_count}")
            return True
        else:
            self.log_test("Rating Calculation Update", False, 
                        f"Rating or count not updated properly. Rating: {initial_rating} → {updated_rating}, Reviews: {initial_review_count} → {updated_review_count}")
        return False
        
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Entrepreneur Catalog Backend API Tests")
        print("=" * 60)
        
        tests = [
            self.test_health_check,
            self.test_get_all_businesses,
            self.test_category_filter,
            self.test_city_filter,
            self.test_search_functionality,
            self.test_pagination,
            self.test_combined_filters,
            self.test_get_business_detail_valid,
            self.test_get_business_detail_invalid,
            self.test_create_review_valid,
            self.test_create_review_invalid_business,
            self.test_create_review_invalid_data,
            self.test_get_business_reviews,
            self.test_get_business_reviews_pagination,
            self.test_get_categories,
            self.test_get_cities,
            self.test_rating_calculation_update
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {e}")
                failed += 1
                
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
                    
        return passed, failed

def main():
    """Main test execution"""
    tester = APITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()