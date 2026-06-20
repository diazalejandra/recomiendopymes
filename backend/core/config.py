from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # MongoDB
    MONGO_URL: str
    DB_NAME: str = "recomiendopymes"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Resend (emails)
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@recomiendopymes.cl"
    FRONTEND_URL: str = "http://localhost:3000"

    # Legal: versión vigente de T&C / Privacidad aceptada al registrarse
    TERMS_VERSION: str = "2026-06-20-borrador"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Admin seed
    ADMIN_EMAIL: str = "admin@recomiendopymes.cl"
    ADMIN_PASSWORD: str = "changeme"
    ADMIN_EMAIL_2: str = "admin2@recomiendopymes.cl"
    ADMIN_PASSWORD_2: str = "changeme2"

    # Dev: desactivar validacion TLS (necesario en redes con SSL inspection)
    MONGO_TLS_ALLOW_INVALID: bool = False

    # Entorno de ejecución
    ENVIRONMENT: str = "development"  # En producción: "production"

    @property
    def COOKIE_SECURE(self) -> bool:
        """True solo en producción (requiere HTTPS). False en desarrollo local."""
        return self.ENVIRONMENT == "production"

    class Config:
        env_file = ".env"

settings = Settings()
