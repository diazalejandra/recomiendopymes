from fastapi import APIRouter, Depends, Query
from typing import List
from .schemas import NewsCreate, NewsUpdate, NewsOut
from .service import NewsService
from modules.auth.dependencies import require_admin

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/public", response_model=List[NewsOut])
async def get_public_news(limit: int = Query(3, ge=1, le=10)):
    """Fetches published news for the homepage."""
    return await NewsService.get_all_news(limit=limit, only_published=True)

@router.get("/admin", response_model=List[NewsOut], dependencies=[Depends(require_admin)])
async def get_admin_news(limit: int = Query(20, ge=1, le=100)):
    """Fetches all news (published and drafts) for the admin panel."""
    return await NewsService.get_all_news(limit=limit, only_published=False)

@router.post("/", response_model=NewsOut, dependencies=[Depends(require_admin)])
async def create_news(data: NewsCreate):
    """Creates a new news item (admin only)."""
    return await NewsService.create_news(data)

@router.patch("/{news_id}", response_model=NewsOut, dependencies=[Depends(require_admin)])
async def update_news(news_id: str, data: NewsUpdate):
    """Updates a news item (admin only)."""
    return await NewsService.update_news(news_id, data)

@router.delete("/{news_id}", dependencies=[Depends(require_admin)])
async def delete_news(news_id: str):
    """Deletes a news item (admin only)."""
    return await NewsService.delete_news(news_id)
