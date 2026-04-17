from fastapi import APIRouter, Depends
from modules.auth.dependencies import get_current_user
from modules.media.service import MediaService

router = APIRouter(prefix="/api/media", tags=["media"])


@router.get("/upload-signature")
async def get_upload_signature():
    """Genera firma para subida directa de imágenes a Cloudinary (Público temporalmente para Inscribir)."""
    service = MediaService()
    return service.get_upload_signature()
