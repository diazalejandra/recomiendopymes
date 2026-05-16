from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class NewsCreate(BaseModel):
    slug: str
    title: str
    content: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tag: str = "Noticia"
    status: str = "draft"
    source: str = "manual"
    published_at: Optional[datetime] = None

class NewsUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tag: Optional[str] = None
    status: Optional[str] = None
    published_at: Optional[datetime] = None

class NewsOut(BaseModel):
    id: str
    slug: str
    title: str
    content: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tag: str
    status: str
    source: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
