from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.auth.dependencies import get_current_user, require_verified
from modules.review.service import ReviewService
from modules.review.models import ReviewCreate

router = APIRouter(tags=["reviews"])


class OwnerResponseRequest(BaseModel):
    text: str


@router.get("/api/businesses/{business_id}/reviews")
async def get_reviews(
    business_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.get_business_reviews(business_id, page=page, limit=limit)


@router.post("/api/businesses/{business_id}/reviews")
async def create_review(
    business_id: str,
    data: ReviewCreate,
    current_user: dict = Depends(require_verified),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.create(business_id, data, current_user)


@router.post("/api/reviews/{review_id}/response")
async def add_owner_response(
    review_id: str,
    body: OwnerResponseRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.add_owner_response(review_id, body.text, current_user)
