import asyncio
import logging
import resend
import jwt
from datetime import datetime, timezone
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from core.config import settings
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    create_email_token, decode_token
)
from modules.auth.models import UserCreate, UserLogin, TokenResponse, UserPublic, UserUpdate

resend.api_key = settings.RESEND_API_KEY

logger = logging.getLogger(__name__)

# Constantes para mensajes de error (evitar literales duplicados)
TOKEN_INVALIDO = "Token inválido"
TOKEN_EXPIRADO_VERIFICACION = "El enlace de verificación ha expirado"
TOKEN_EXPIRADO_RESET = "El enlace ha expirado. Solicita uno nuevo."


async def send_verification_email(email: str, name: str, token: str):
    """Envía email de verificación via Resend. Skip silencioso en dev sin API key."""
    verify_url = f"{settings.FRONTEND_URL}/verificar-email?token={token}"
    if not settings.RESEND_API_KEY:
        print(f"\n[DEV MODE] Enlace de verificación para {email}:\n{verify_url}\n")
        return
    payload = {
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Verifica tu email — RecomiendoPymes",
        "html": f"""
        <h2>Hola {name},</h2>
        <p>Gracias por registrarte en RecomiendoPymes.</p>
        <p>Por favor verifica tu email haciendo click en el siguiente enlace:</p>
        <a href="{verify_url}">Verificar mi email</a>
        <p>Este enlace expira en 24 horas.</p>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        """
    }
    try:
        await asyncio.to_thread(resend.Emails.send, payload)
    except Exception:
        # Best-effort: un fallo de Resend no debe romper el registro.
        # El usuario puede reintentar con "reenviar verificación".
        logger.exception("Fallo al enviar email de verificación a %s", email)


async def send_password_reset_email(email: str, name: str, token: str):
    """Envía email de reset de contraseña."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    if not settings.RESEND_API_KEY:
        print(f"\n[DEV MODE] Enlace de recuperación para {email}:\n{reset_url}\n")
        return
    payload = {
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Recuperar contraseña — RecomiendoPymes",
        "html": f"""
        <h2>Hola {name},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="{reset_url}">Restablecer contraseña</a>
        <p>Este enlace expira en 15 minutos. Si no solicitaste esto, ignora este email.</p>
        """
    }
    try:
        await asyncio.to_thread(resend.Emails.send, payload)
    except Exception:
        # Best-effort: no romper el flujo ni revelar si el email existe.
        logger.exception("Fallo al enviar email de recuperación a %s", email)


def _doc_to_user_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc["name"],
        role=doc["role"],
        is_active=doc.get("is_active", True),
        is_email_verified=doc.get("is_email_verified", False),
        created_at=doc.get("created_at", datetime.now(timezone.utc))
    )


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users = db.users

    async def register(self, user_data: UserCreate) -> TokenResponse:
        existing = await self.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Este email ya está registrado")

        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "password_hash": hash_password(user_data.password),
            "role": "user",
            "is_active": True,
            "is_email_verified": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        result = await self.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        verify_token = create_email_token(
            {"sub": user_id, "purpose": "verify_email"}, expire_minutes=60 * 24
        )
        await send_verification_email(user_data.email, user_data.name, verify_token)

        doc = await self.users.find_one({"_id": result.inserted_id})
        access_token = create_access_token({"sub": user_id, "role": "user"})
        return TokenResponse(access_token=access_token, user=_doc_to_user_public(doc))

    async def login(self, credentials: UserLogin) -> TokenResponse:
        user = await self.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")

        access_token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
        return TokenResponse(access_token=access_token, user=_doc_to_user_public(user))

    async def verify_email(self, token: str) -> dict:
        try:
            payload = decode_token(token)
            if payload.get("purpose") != "verify_email":
                raise HTTPException(status_code=400, detail=TOKEN_INVALIDO)
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail=TOKEN_EXPIRADO_VERIFICACION)
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail=TOKEN_INVALIDO)

        await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_email_verified": True, "updated_at": datetime.now(timezone.utc)}}
        )
        return {"message": "Email verificado correctamente"}

    async def resend_verification(self, user_id: str) -> dict:
        user = await self.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if user.get("is_email_verified"):
            return {"message": "Email ya verificado"}
        token = create_email_token(
            {"sub": user_id, "purpose": "verify_email"}, expire_minutes=60 * 24
        )
        await send_verification_email(user["email"], user["name"], token)
        return {"message": "Email de verificación reenviado"}

    async def forgot_password(self, email: str) -> dict:
        user = await self.users.find_one({"email": email})
        # Por seguridad, siempre responder igual aunque el email no exista
        if user:
            token = create_email_token(
                {"sub": str(user["_id"]), "purpose": "reset_password"}, expire_minutes=15
            )
            await send_password_reset_email(email, user["name"], token)
        return {"message": "Si el email existe, recibirás las instrucciones para restablecer tu contraseña"}

    async def reset_password(self, token: str, new_password: str) -> dict:
        try:
            payload = decode_token(token)
            if payload.get("purpose") != "reset_password":
                raise HTTPException(status_code=400, detail=TOKEN_INVALIDO)
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail=TOKEN_EXPIRADO_RESET)
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail=TOKEN_INVALIDO)

        await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": hash_password(new_password), "updated_at": datetime.now(timezone.utc)}}
        )
        return {"message": "Contraseña actualizada correctamente"}

    async def update_profile(self, user_id: str, data: UserUpdate) -> UserPublic:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        doc = await self.users.find_one({"_id": ObjectId(user_id)})
        return _doc_to_user_public(doc)

    async def get_by_id(self, user_id: str) -> dict | None:
        return await self.users.find_one({"_id": ObjectId(user_id)})
