from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG


class SocialLinks(BaseModel):
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    tiktok: Optional[str] = None
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None  # correo de contacto público


class Coordinates(BaseModel):
    lat: float
    lng: float
    is_exact: bool = False  # True = pin ubicado por el usuario; False = centroide de ciudad


class BusinessCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=80)
    description: str = Field(..., min_length=10, max_length=1000)
    owner: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(..., pattern="^(online|physical|both)$")
    delivery_type: str = Field(
        default="nationwide",
        pattern="^(nationwide|local|pickup_only|local_and_pickup)$"
    )
    city: str = Field(..., min_length=2, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: Optional[List[str]] = Field(default_factory=list)
    established: Optional[str] = None


class BusinessUpdate(BaseModel):
    category: Optional[str] = Field(None, min_length=2, max_length=80)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    owner: Optional[str] = Field(None, min_length=2, max_length=100)
    business_type: Optional[str] = Field(None, pattern="^(online|physical|both)$")
    delivery_type: Optional[str] = Field(
        None, pattern="^(nationwide|local|pickup_only|local_and_pickup)$"
    )
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: Optional[List[str]] = None
    established: Optional[str] = None


class Business(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    slug: str
    category: str
    description: str
    owner: str
    owner_user_id: Optional[PyObjectId] = None
    business_type: str
    delivery_type: str = "nationwide"
    city: str
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    established: Optional[str] = None

    # Moderación
    status: str = "pending"  # pending | active | inactive
    activated_at: Optional[datetime] = None  # fecha de primera aprobación (para badge Nuevo)

    # Monetización (Fase 2 — reservado)
    featured: bool = False
    featured_until: Optional[datetime] = None
    is_verified: bool = False

    # Métricas
    rating: float = 0.0
    review_count: int = 0
    view_count: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = MONGO_MODEL_CONFIG


class BusinessPublic(BaseModel):
    """Respuesta pública de un negocio (para catálogo y perfil)"""
    id: str
    name: str
    slug: str
    category: str
    description: str
    owner: str
    owner_user_id: Optional[str] = None
    business_type: str
    delivery_type: str
    city: str
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    established: Optional[str] = None
    status: str
    activated_at: Optional[datetime] = None
    featured: bool
    is_verified: bool
    rating: float
    review_count: int
    view_count: int
    created_at: datetime
