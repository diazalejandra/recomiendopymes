from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

class NewsArticle(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    slug: str
    title: str
    content: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tag: str = "Noticia"
    status: str = "draft"  # "draft" | "published"
    source: str = "manual" # "manual" | "n8n"
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

