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
    
    if settings.MONGO_TLS_ALLOW_INVALID:
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
