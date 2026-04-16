from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import connect_db, close_db, get_db

# Routers
from modules.auth.router import router as auth_router
from modules.business.router import router as business_router
from modules.review.router import router as review_router
from modules.media.router import router as media_router
from modules.admin.router import router as admin_router
from modules.meta.router import router as meta_router
from modules.news.router import router as news_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Conectar DB al iniciar, cerrar al apagar."""
    await connect_db()
    try:
        await _create_indexes()
    except Exception as e:
        # No fallar el startup por índices — se crean en la primera operación
        print(f"Warning: index creation deferred — {e}")
    yield
    await close_db()


async def _create_indexes():
    """Crea índices MongoDB para performance."""
    db = get_db()

    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    await db.users.create_index("is_active")

    # Businesses
    await db.businesses.create_index("slug", unique=True)
    await db.businesses.create_index("status")
    await db.businesses.create_index("category")
    await db.businesses.create_index("city")
    await db.businesses.create_index("owner_user_id")
    await db.businesses.create_index([("status", 1), ("featured", -1), ("rating", -1)])

    # Reviews
    await db.reviews.create_index([("business_id", 1), ("is_visible", 1)])
    await db.reviews.create_index([("author_id", 1), ("created_at", -1)])
    await db.reviews.create_index([("business_id", 1), ("author_id", 1)], unique=True)

    # Legal & Config (small collections, no indexes needed)

    # News
    await db.news.create_index([("is_published", 1), ("created_at", -1)])


def create_app() -> FastAPI:
    app = FastAPI(
        title="RecomiendoPymes API",
        description="API para el catálogo de emprendedores chilenos",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registrar routers
    app.include_router(auth_router)
    app.include_router(business_router)
    app.include_router(review_router)
    app.include_router(media_router)
    app.include_router(admin_router)
    app.include_router(meta_router)
    app.include_router(news_router)

    @app.get("/", tags=["health"])
    async def root():
        return {"status": "ok", "api": "RecomiendoPymes", "version": "1.0.0"}

    @app.get("/api/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
