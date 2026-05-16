from fastapi import APIRouter, Depends, Query, Header, HTTPException
from typing import List
from .schemas import NewsCreate, NewsUpdate, NewsOut
from .service import NewsService
from modules.auth.dependencies import require_admin
import os

router = APIRouter(prefix="/api/news", tags=["News"])

@router.post("/webhook", response_model=NewsOut)
async def webhook_create_news(
    data: NewsCreate, 
    x_api_key: str = Header(None)
):
    """Webhook endpoint for n8n to create a draft news article."""
    expected_key = os.environ.get("N8N_WEBHOOK_SECRET", "super-secret-key-123")
    if not x_api_key or x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    
    # Ensure source is n8n and status is draft for safety
    data.source = "n8n"
    data.status = "draft"
    
    return await NewsService.create_news(data)


@router.get("/public", response_model=List[NewsOut])
async def get_public_news(limit: int = Query(10, ge=1, le=50)):
    """Fetches published news for the homepage or news page."""
    return await NewsService.get_all_news(limit=limit, only_published=True)

@router.get("/public/{slug}", response_model=NewsOut)
async def get_public_news_by_slug(slug: str):
    """Fetches a specific published news article by slug."""
    return await NewsService.get_news_by_slug(slug)

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
