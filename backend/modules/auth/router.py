from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from core.config import settings
from core.security import create_refresh_token, decode_token, create_access_token
from modules.auth.models import (
    UserCreate, UserLogin, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest, UserUpdate
)
from modules.auth.service import AuthService
from modules.auth.dependencies import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
import jwt

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    result = await service.register(user_data)
    refresh_token = create_refresh_token({"sub": result.user.id, "role": result.user.role})
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=settings.COOKIE_SECURE, samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return result


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    result = await service.login(credentials)
    refresh_token = create_refresh_token({"sub": result.user.id, "role": result.user.role})
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=settings.COOKIE_SECURE, samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return result


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada correctamente"}


@router.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No hay sesión activa")
    try:
        payload = decode_token(refresh_token)
        user_id = payload["sub"]
        role = payload.get("role", "user")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Sesión inválida")

    access_token = create_access_token({"sub": user_id, "role": role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_email(token)


@router.post("/resend-verification")
async def resend_verification(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AuthService(db)
    return await service.resend_verification(str(current_user["_id"]))


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, request_data: ForgotPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.forgot_password(request_data.email)


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.reset_password(request.token, request.new_password)


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    from modules.auth.service import _doc_to_user_public
    return _doc_to_user_public(current_user)


@router.put("/me")
async def update_me(
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AuthService(db)
    return await service.update_profile(str(current_user["_id"]), data)
