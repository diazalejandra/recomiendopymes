from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import Optional
from .models import (
    Business, BusinessCreate, BusinessUpdate, BusinessResponse,
    BusinessDetailResponse, Review, ReviewCreate, ReviewResponse,
    CategoryResponse, CityResponse
)
from .services.business_service import BusinessService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
business_service = BusinessService(db)

# Create the main app without a prefix
app = FastAPI(title="Entrepreneur Catalog API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Startup event to create indexes
@app.on_event("startup")
async def startup_event():
    await business_service.create_indexes()
    logging.info("Database indexes created")

# Business endpoints
@api_router.get("/businesses", response_model=BusinessResponse)
async def get_businesses(
    category: Optional[str] = Query(None, description="Filter by category"),
    city: Optional[str] = Query(None, description="Filter by city"),
    search: Optional[str] = Query(None, description="Search in name, description, category, city"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page")
):
    """Get businesses with filtering, search, and pagination"""
    try:
        result = await business_service.get_businesses(
            category=category,
            city=city, 
            search=search,
            page=page,
            limit=limit
        )
        return BusinessResponse(**result)
    except Exception as e:
        logging.error(f"Error fetching businesses: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/businesses/{business_id}", response_model=BusinessDetailResponse)
async def get_business_detail(business_id: str):
    """Get single business with its reviews"""
    try:
        business = await business_service.get_business_by_id(business_id)
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")
        
        reviews_data = await business_service.get_business_reviews(business_id)
        
        return BusinessDetailResponse(
            business=business,
            reviews=reviews_data["reviews"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching business detail: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/businesses", response_model=Business)
async def create_business(business_data: BusinessCreate):
    """Create a new business"""
    try:
        business = await business_service.create_business(business_data)
        return business
    except Exception as e:
        logging.error(f"Error creating business: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/businesses/{business_id}", response_model=Business)
async def update_business(business_id: str, business_data: BusinessUpdate):
    """Update a business"""
    try:
        business = await business_service.update_business(business_id, business_data)
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")
        return business
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating business: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/businesses/{business_id}")
async def delete_business(business_id: str):
    """Delete a business and all its reviews"""
    try:
        success = await business_service.delete_business(business_id)
        if not success:
            raise HTTPException(status_code=404, detail="Business not found")
        return {"message": "Business deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting business: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Review endpoints
@api_router.get("/businesses/{business_id}/reviews", response_model=ReviewResponse)
async def get_business_reviews(
    business_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page")
):
    """Get reviews for a specific business"""
    try:
        reviews_data = await business_service.get_business_reviews(
            business_id, page, limit
        )
        return ReviewResponse(**reviews_data)
    except Exception as e:
        logging.error(f"Error fetching reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/businesses/{business_id}/reviews", response_model=Review)
async def create_review(business_id: str, review_data: ReviewCreate):
    """Submit a new review for a business"""
    try:
        review = await business_service.create_review(business_id, review_data)
        if not review:
            raise HTTPException(status_code=404, detail="Business not found")
        return review
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating review: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Category and City endpoints
@api_router.get("/categories", response_model=CategoryResponse)
async def get_categories():
    """Get all available categories"""
    try:
        categories = await business_service.get_categories()
        return CategoryResponse(categories=categories)
    except Exception as e:
        logging.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/cities", response_model=CityResponse)
async def get_cities():
    """Get all available cities"""
    try:
        cities = await business_service.get_cities()
        return CityResponse(cities=cities)
    except Exception as e:
        logging.error(f"Error fetching cities: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Entrepreneur Catalog API", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
