from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, timezone
from urllib.parse import urlparse
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG
from core.config import settings

CLOUDINARY_DELIVERY_HOST = "res.cloudinary.com"


def _validate_cloudinary_url(url: Optional[str]) -> Optional[str]:
    """Solo acepta URLs de entrega de Cloudinary de nuestra cuenta (ME-4).

    Evita que se guarden URLs arbitrarias vía API (hotlinking, pseudo-URLs `javascript:`,
    imágenes externas de terceros). Las imágenes legítimas se suben a Cloudinary con firma
    (ME-1) y quedan como `https://res.cloudinary.com/<cloud>/...`.
    """
    if not url:
        return url
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != CLOUDINARY_DELIVERY_HOST:
        raise ValueError("La imagen debe ser una URL de Cloudinary (https://res.cloudinary.com/...)")
    cloud = settings.CLOUDINARY_CLOUD_NAME
    if cloud:
        segments = [s for s in parsed.path.split("/") if s]
        if not segments or segments[0] != cloud:
            raise ValueError("La imagen no pertenece a la cuenta de Cloudinary configurada")
    return url


def _validate_gallery(gallery: Optional[List[str]]) -> Optional[List[str]]:
    if not gallery:
        return gallery
    return [_validate_cloudinary_url(u) for u in gallery]


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


class Offer(BaseModel):
    title: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    discount: str = Field(..., max_length=20)
    expires_at: datetime


class BusinessCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=80)
    description: str = Field(..., min_length=10, max_length=1000)
    owner: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(..., pattern="^(online|physical|both)$")
    delivery_scope: str = Field(
        default="local",
        pattern="^(nationwide|local)$"
    )
    delivery_methods: List[str] = Field(default_factory=list)
    active_offer: Optional[Offer] = None
    region: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: Optional[List[str]] = Field(default_factory=list)
    established: Optional[str] = None

    _v_image = field_validator("image")(_validate_cloudinary_url)
    _v_gallery = field_validator("gallery")(_validate_gallery)


class BusinessUpdate(BaseModel):
    category: Optional[str] = Field(None, min_length=2, max_length=80)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    owner: Optional[str] = Field(None, min_length=2, max_length=100)
    business_type: Optional[str] = Field(None, pattern="^(online|physical|both)$")
    delivery_scope: Optional[str] = Field(
        None, pattern="^(nationwide|local)$"
    )
    delivery_methods: Optional[List[str]] = None
    active_offer: Optional[Offer] = None
    region: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    social_links: Optional[SocialLinks] = None
    image: Optional[str] = None
    gallery: Optional[List[str]] = None
    established: Optional[str] = None

    _v_image = field_validator("image")(_validate_cloudinary_url)
    _v_gallery = field_validator("gallery")(_validate_gallery)


class Business(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    slug: str
    category: str
    description: str
    owner: str
    owner_user_id: Optional[PyObjectId] = None
    business_type: str
    delivery_scope: str = "nationwide"
    delivery_methods: List[str] = Field(default_factory=list)
    active_offer: Optional[Offer] = None
    region: Optional[str] = None
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

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
    delivery_scope: str
    delivery_methods: List[str] = Field(default_factory=list)
    active_offer: Optional[Offer] = None
    region: Optional[str] = None
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
