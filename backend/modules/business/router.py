from fastapi import APIRouter, Depends, Query
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.auth.dependencies import get_current_user, require_admin, get_current_user_optional
from modules.business.service import BusinessService
from modules.business.models import BusinessCreate, BusinessUpdate
from modules.review.service import ReviewService

router = APIRouter(prefix="/api/businesses", tags=["businesses"])


@router.get("")
async def list_businesses(
    category: Optional[str] = Query(None, max_length=80),
    city: Optional[str] = Query(None, max_length=80),
    search: Optional[str] = Query(None, max_length=100),
    nationwide: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.get_businesses(category=category, city=city, search=search, nationwide=nationwide, page=page, limit=limit)


@router.get("/mine")
async def get_my_businesses(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.get_mine(str(current_user["_id"]))


@router.get("/{slug_or_id}")
async def get_business(
    slug_or_id: str, 
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    review_svc = ReviewService(db)
    from bson import ObjectId
    if ObjectId.is_valid(slug_or_id):
        business = await service.get_by_id(slug_or_id, current_user)
    else:
        business = await service.get_by_slug(slug_or_id, current_user)
    # Return wrapper {business, reviews} expected by BusinessDetail.jsx
    review_data = await review_svc.get_business_reviews(business["id"], page=1, limit=50)
    return {"business": business, "reviews": review_data.get("reviews", [])}


@router.post("")
async def create_business(
    data: BusinessCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.create(data, str(current_user["_id"]))


@router.put("/{business_id}")
async def update_business(
    business_id: str,
    data: BusinessUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.update(business_id, data, str(current_user["_id"]))


@router.patch("/{business_id}/status")
async def change_business_status(
    business_id: str,
    new_status: str = Query(..., pattern="^(active|inactive|pending)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    is_admin = current_user.get("role") == "admin"
    return await service.change_status(
        business_id, new_status,
        by_admin=is_admin,
        owner_id=None if is_admin else str(current_user["_id"])
    )


@router.delete("/{business_id}")
async def delete_business(
    business_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.delete(business_id)
