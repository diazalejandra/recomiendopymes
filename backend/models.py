from pydantic import BaseModel, Field, field_validator
from pydantic_core import core_schema
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

class SocialLinks(BaseModel):
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    etsy: Optional[str] = None
    pinterest: Optional[str] = None

class BusinessBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=10, max_length=1000)
    image: str = Field(..., description="Main image URL")
    gallery: List[str] = Field(default_factory=list, max_items=10)
    social_links: SocialLinks = Field(default_factory=SocialLinks, alias="socialLinks")
    owner: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=50)
    established: str = Field(..., min_length=4, max_length=4)

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    image: Optional[str] = None
    gallery: Optional[List[str]] = Field(None, max_items=10)
    social_links: Optional[SocialLinks] = Field(None, alias="socialLinks")
    owner: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, min_length=1, max_length=50)
    established: Optional[str] = Field(None, min_length=4, max_length=4)

class Business(BusinessBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    rating: float = Field(default=0.0, ge=0, le=5)
    review_count: int = Field(default=0, ge=0, alias="reviews")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=10, max_length=500)
    reviewer: str = Field(..., min_length=1, max_length=100)

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId = Field(..., alias="businessId")
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class BusinessResponse(BaseModel):
    businesses: List[Business]
    total: int
    page: int
    total_pages: int

class BusinessDetailResponse(BaseModel):
    business: Business
    reviews: List[Review]

class ReviewResponse(BaseModel):
    reviews: List[Review]
    total: int

class CategoryResponse(BaseModel):
    categories: List[str]

class CityResponse(BaseModel):
    cities: List[str]