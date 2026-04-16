from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class NewsCreate(BaseModel):
    title: str
    content: str
    tag: str = "Noticia"
    url: Optional[str] = None
    is_published: bool = True

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tag: Optional[str] = None
    url: Optional[str] = None
    is_published: Optional[bool] = None

class NewsOut(BaseModel):
    id: str
    title: str
    content: str
    tag: str
    url: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
