from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional, Dict, Any
import re
from datetime import datetime
from ..models import Business, BusinessCreate, BusinessUpdate, Review, ReviewCreate

class BusinessService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.businesses = db.businesses
        self.reviews = db.reviews

    async def create_indexes(self):
        """Create database indexes for better performance"""
        # Text index for search functionality
        await self.businesses.create_index([
            ("name", "text"),
            ("description", "text"),
            ("category", "text"),
            ("city", "text")
        ])
        
        # Individual indexes for filtering
        await self.businesses.create_index("category")
        await self.businesses.create_index("city")
        await self.businesses.create_index("rating")
        await self.reviews.create_index("business_id")

    async def get_businesses(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 12
    ) -> Dict[str, Any]:
        """Get businesses with filtering, search, and pagination"""
        
        # Build query filters
        query = {}
        
        if category and category != "All":
            query["category"] = category
            
        if city and city != "All Cities":
            query["city"] = city
            
        if search:
            # Use text search for better performance
            query["$text"] = {"$search": search}
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Get total count
        total = await self.businesses.count_documents(query)
        
        # Build aggregation pipeline for sorting and pagination
        pipeline = []
        
        if query:
            pipeline.append({"$match": query})
        
        # Sort by rating (highest first), then by name
        pipeline.extend([
            {"$sort": {"rating": -1, "name": 1}},
            {"$skip": skip},
            {"$limit": limit}
        ])
        
        # Execute aggregation
        cursor = self.businesses.aggregate(pipeline)
        businesses = []
        
        async for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            businesses.append(Business(**doc))
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "businesses": businesses,
            "total": total,
            "page": page,
            "total_pages": total_pages
        }

    async def get_business_by_id(self, business_id: str) -> Optional[Business]:
        """Get a single business by ID"""
        if not ObjectId.is_valid(business_id):
            return None
            
        doc = await self.businesses.find_one({"_id": ObjectId(business_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return Business(**doc)
        return None

    async def create_business(self, business_data: BusinessCreate) -> Business:
        """Create a new business"""
        business_dict = business_data.dict(by_alias=True)
        business_dict["created_at"] = datetime.utcnow()
        business_dict["updated_at"] = datetime.utcnow()
        business_dict["rating"] = 0.0
        business_dict["reviews"] = 0
        
        result = await self.businesses.insert_one(business_dict)
        
        # Return the created business
        return await self.get_business_by_id(str(result.inserted_id))

    async def update_business(self, business_id: str, business_data: BusinessUpdate) -> Optional[Business]:
        """Update a business"""
        if not ObjectId.is_valid(business_id):
            return None
        
        update_data = business_data.dict(by_alias=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.businesses.update_one(
                {"_id": ObjectId(business_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await self.get_business_by_id(business_id)
        
        return await self.get_business_by_id(business_id)

    async def delete_business(self, business_id: str) -> bool:
        """Delete a business and all its reviews"""
        if not ObjectId.is_valid(business_id):
            return False
            
        # Delete all reviews for this business
        await self.reviews.delete_many({"business_id": ObjectId(business_id)})
        
        # Delete the business
        result = await self.businesses.delete_one({"_id": ObjectId(business_id)})
        return result.deleted_count > 0

    async def get_business_reviews(self, business_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get reviews for a specific business"""
        if not ObjectId.is_valid(business_id):
            return {"reviews": [], "total": 0}
            
        skip = (page - 1) * limit
        
        # Get total count
        total = await self.reviews.count_documents({"business_id": ObjectId(business_id)})
        
        # Get reviews sorted by date (newest first)
        cursor = self.reviews.find({"business_id": ObjectId(business_id)}) \
                            .sort("date", -1) \
                            .skip(skip) \
                            .limit(limit)
        
        reviews = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["business_id"] = str(doc["business_id"])
            reviews.append(Review(**doc))
        
        return {
            "reviews": reviews,
            "total": total
        }

    async def create_review(self, business_id: str, review_data: ReviewCreate) -> Optional[Review]:
        """Create a new review and update business rating"""
        if not ObjectId.is_valid(business_id):
            return None
            
        # Check if business exists
        business = await self.get_business_by_id(business_id)
        if not business:
            return None
        
        # Create review
        review_dict = review_data.dict()
        review_dict["business_id"] = ObjectId(business_id)
        review_dict["date"] = datetime.utcnow()
        review_dict["created_at"] = datetime.utcnow()
        
        result = await self.reviews.insert_one(review_dict)
        
        # Recalculate business rating
        await self._update_business_rating(business_id)
        
        # Return the created review
        review_doc = await self.reviews.find_one({"_id": result.inserted_id})
        if review_doc:
            review_doc["_id"] = str(review_doc["_id"])
            review_doc["business_id"] = str(review_doc["business_id"])
            return Review(**review_doc)
        
        return None

    async def _update_business_rating(self, business_id: str):
        """Recalculate and update business rating based on all reviews"""
        pipeline = [
            {"$match": {"business_id": ObjectId(business_id)}},
            {"$group": {
                "_id": "$business_id",
                "avg_rating": {"$avg": "$rating"},
                "review_count": {"$sum": 1}
            }}
        ]
        
        result = []
        async for doc in self.reviews.aggregate(pipeline):
            result.append(doc)
        
        if result:
            avg_rating = round(result[0]["avg_rating"], 1)
            review_count = result[0]["review_count"]
        else:
            avg_rating = 0.0
            review_count = 0
        
        # Update business
        await self.businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {
                "rating": avg_rating,
                "reviews": review_count,
                "updated_at": datetime.utcnow()
            }}
        )

    async def get_categories(self) -> List[str]:
        """Get all unique categories from businesses"""
        categories = await self.businesses.distinct("category")
        return ["All"] + sorted(categories)

    async def get_cities(self) -> List[str]:
        """Get all unique cities from businesses"""
        cities = await self.businesses.distinct("city")
        return ["All Cities"] + sorted(cities)