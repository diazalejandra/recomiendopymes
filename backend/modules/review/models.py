from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG


class ReviewResponse(BaseModel):
    """Respuesta del dueño del negocio a una reseña."""
    text: str = Field(..., min_length=1, max_length=500)
    author: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=800)


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, min_length=10, max_length=800)


class Review(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    author_id: PyObjectId
    author_name: str
    rating: int
    comment: str
    is_visible: bool = True
    owner_response: Optional[ReviewResponse] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = MONGO_MODEL_CONFIG


class ReviewPublic(BaseModel):
    id: str
    business_id: str
    author_id: str
    author_name: str
    rating: int
    comment: str
    is_visible: bool
    owner_response: Optional[ReviewResponse] = None
    created_at: datetime
