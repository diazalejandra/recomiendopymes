from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.config import settings

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


import certifi

async def connect_db():
    global client, db
    
    kwargs = {
        "serverSelectionTimeoutMS": 5000,
        "connectTimeoutMS": 5000,
        "socketTimeoutMS": 10000,
        # Devuelve datetimes tz-aware (UTC) para evitar mezclar naive/aware en aritmética
        "tz_aware": True,
    }

    # TLS solo cuando la conexión lo requiere. Atlas (`mongodb+srv://`) lo activa solo;
    # un Mongo local/CI plano (`mongodb://host`) NO habla TLS y forzarlo rompe el handshake.
    url_lower = settings.MONGO_URL.lower()
    use_tls = (
        url_lower.startswith("mongodb+srv://")
        or "tls=true" in url_lower
        or "ssl=true" in url_lower
        or settings.MONGO_TLS_ALLOW_INVALID
    )
    if use_tls:
        if settings.MONGO_TLS_ALLOW_INVALID:
            # Redes con inspección SSL (corporativas): no validar el certificado.
            kwargs["tlsAllowInvalidCertificates"] = True
        else:
            kwargs["tlsCAFile"] = certifi.where()

    client = AsyncIOMotorClient(settings.MONGO_URL, **kwargs)
    db = client[settings.DB_NAME]


async def close_db():
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    return db
