from fastapi import APIRouter, Depends
from modules.auth.dependencies import get_current_user
from modules.media.service import MediaService

router = APIRouter(prefix="/api/media", tags=["media"])


@router.get("/upload-signature")
async def get_upload_signature(current_user: dict = Depends(get_current_user)):
    """Genera firma para subida directa de imágenes a Cloudinary. Requiere autenticación
    para evitar abuso del cupo free-tier (ME-1)."""
    service = MediaService()
    return service.get_upload_signature()
