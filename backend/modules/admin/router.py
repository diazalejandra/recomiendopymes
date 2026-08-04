from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.auth.dependencies import require_admin
from modules.admin.service import AdminService

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
async def get_dashboard(
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_dashboard()


@router.get("/businesses")
async def list_businesses(
    status: Optional[str] = Query(None, pattern="^(pending|active|inactive)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_businesses(status=status, page=page, limit=limit)


@router.patch("/businesses/{business_id}/approve")
async def approve_business(
    business_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.approve_business(business_id)


@router.patch("/businesses/{business_id}/reject")
async def reject_business(
    business_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.reject_business(business_id)


@router.get("/reviews")
async def list_reviews(
    visible_only: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_reviews(visible_only=visible_only, page=page, limit=limit)


@router.patch("/reviews/{review_id}/visibility")
async def toggle_review_visibility(
    review_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.toggle_review_visibility(review_id)


@router.get("/users")
async def list_users(
    suspicious_only: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_users(page=page, limit=limit, suspicious_only=suspicious_only)


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.toggle_user_active(user_id)


@router.patch("/users/{user_id}/promote")
async def promote_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.promote_user(user_id)


@router.patch("/users/{user_id}/demote")
async def demote_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.demote_user(user_id)


@router.patch("/users/{user_id}/clear-suspicious")
async def clear_suspicious(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.clear_suspicious(user_id)


@router.get("/legal/{key}")
async def get_legal(
    key: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = await db.legal.find_one({"key": key})
    return {"key": key, "content": doc["content"] if doc else ""}


@router.put("/legal/{key}")
async def update_legal(
    key: str,
    body: dict,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    from datetime import datetime, timezone
    await db.legal.update_one(
        {"key": key},
        {"$set": {"content": body.get("content", ""), "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    return {"key": key, "message": "Actualizado correctamente"}


@router.get("/config")
async def get_config(
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.config.find({})
    return {"config": [{"key": doc["key"], "value": doc["value"]} async for doc in cursor]}


# Claves de configuración permitidas (AD-7: whitelist, no aceptar cualquier clave).
# Solo se exponen las claves que el código realmente consume:
#   - review_rate_limit → detección de reseñas sospechosas (review/service.py)
#   - boost_days        → ventana del badge "Nuevo" y boost de orden (business/service.py)
ALLOWED_CONFIG_KEYS = {
    "review_rate_limit",
    "boost_days",
}


@router.put("/config/{key}")
async def update_config(
    key: str,
    body: dict,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if key not in ALLOWED_CONFIG_KEYS:
        raise HTTPException(status_code=400, detail=f"Clave de configuración no permitida: {key}")
    from datetime import datetime, timezone
    await db.config.update_one(
        {"key": key},
        {"$set": {"value": body.get("value"), "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    return {"key": key, "message": "Configuración actualizada"}
