from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    """Entrada de registro. Solo expone campos que el cliente puede fijar.

    `role`, `is_active` e `is_email_verified` NO están aquí a propósito (B-4): son
    controlados por el servidor. Exponerlos permitiría a un atacante auto-asignarse
    `role="admin"` o `is_email_verified=True` si algún refactor usara `model_dump()`.
    """
    password: str = Field(..., min_length=8, max_length=100)
    accepted_terms: bool = False  # debe ser True; el servicio lo valida


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    # Campos controlados por el servidor (no vienen del registro)
    role: str = Field(default="user")
    is_active: bool = True
    is_email_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = MONGO_MODEL_CONFIG


class UserPublic(BaseModel):
    """Versión pública del usuario (sin password_hash)"""
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
