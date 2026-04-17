import cloudinary
import cloudinary.uploader
from fastapi import HTTPException
from core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class MediaService:
    def get_upload_signature(self) -> dict:
        """Genera una firma para subir imágenes directamente desde el frontend a Cloudinary."""
        if not settings.CLOUDINARY_API_SECRET:
            raise HTTPException(
                status_code=503,
                detail="Servicio de imágenes no configurado. Configura CLOUDINARY_* en .env"
            )
        import time
        timestamp = int(time.time())
        params = {
            "timestamp": timestamp,
            "folder": "recomiendopymes",
            "transformation": "c_fill,w_800,h_800,q_auto,f_auto",
        }
        signature = cloudinary.utils.api_sign_request(params, settings.CLOUDINARY_API_SECRET)
        return {
            "signature": signature,
            "timestamp": timestamp,
            "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
            "api_key": settings.CLOUDINARY_API_KEY,
            "folder": "recomiendopymes",
            "transformation": "c_fill,w_800,h_800,q_auto,f_auto",
        }
