from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
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

# Rate limiter (por IP)
limiter = Limiter(key_func=get_remote_address)


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

    # News
    await db.news.create_index([("status", 1), ("created_at", -1)])


def create_app() -> FastAPI:
    app = FastAPI(
        title="RecomiendoPymes API",
        description="API para el catálogo de emprendedores chilenos",
        version="1.0.0",
        lifespan=lifespan,
        # Ocultar docs en producción
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

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
