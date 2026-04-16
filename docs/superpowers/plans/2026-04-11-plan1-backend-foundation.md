# Plan 1: Backend Foundation — Refactor Modular + Auth + Modelos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestructurar el backend en módulos independientes, agregar autenticación JWT completa con roles, actualizar todos los modelos de datos según el spec, e integrar Cloudinary y Resend. El resultado es una API completamente funcional y testeable antes de tocar el frontend.

**Architecture:** El backend se reorganiza de un único `server.py` + `models.py` a una estructura modular con `core/` (config, db, security), `modules/auth/`, `modules/business/`, `modules/review/`, `modules/media/`, `modules/admin/` y `modules/meta/`. Cada módulo tiene sus propios models, service y router. El `server.py` actúa como app factory que registra todos los routers.

**Tech Stack:** Python 3.11+, FastAPI, Motor (async MongoDB), Pydantic v2, PyJWT, Passlib[bcrypt], Resend (emails), Cloudinary, python-slugify, pytest-asyncio

---

## Contexto del codebase actual

Antes de empezar, familiarízate con la estructura existente:
- `backend/server.py` — app actual con todos los endpoints
- `backend/models.py` — todos los modelos Pydantic
- `backend/services/business_service.py` — lógica de negocio actual
- `backend/requirements.txt` — dependencias actuales
- `backend/seed_data.py` — datos de prueba en inglés

La lógica de negocio existente está bien escrita y se conserva — solo se mueve a los módulos correspondientes.

## Inventario de archivos a eliminar (residuos heredados)

Este plan reemplaza los siguientes archivos. **No borrar antes de que el reemplazo esté probado** (cada tarea indica el momento exacto):

| Archivo heredado | Reemplazado por | Eliminar en |
|---|---|---|
| `backend/services/business_service.py` | `modules/business/service.py` | Task 8 |
| `backend/services/` (directorio vacío) | — | Task 8 |
| Clases en `backend/models.py` (Business, Review, etc.) | modelos propios de cada módulo | Task 3 |
| `backend/server.py` (monolítico) | nuevo `server.py` app factory | Task 14 |

**NOTA sobre auto_commit:** Revisar `.agent/config.yml`. Si `auto_commit: false`, omitir todos los pasos de commit.

---

## Task 1: Preparar dependencias y estructura de carpetas

**Files:**
- Modify: `backend/requirements.txt`
- Create: `backend/core/__init__.py`
- Create: `backend/modules/__init__.py`
- Create: `backend/modules/auth/__init__.py`
- Create: `backend/modules/business/__init__.py`
- Create: `backend/modules/review/__init__.py`
- Create: `backend/modules/media/__init__.py`
- Create: `backend/modules/admin/__init__.py`
- Create: `backend/modules/meta/__init__.py`
- Create: `backend/modules/payments/__init__.py` (placeholder)
- Create: `backend/modules/payments/README.md`

- [ ] **Step 1: Actualizar requirements.txt**

```
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.5.0
pydantic>=2.6.4
pydantic-settings>=2.2.0
python-dotenv>=1.0.1
passlib[bcrypt]>=1.7.4
pyjwt>=2.10.1
python-slugify>=8.0.4
resend>=1.0.0
cloudinary>=1.40.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.27.0
black>=24.1.1
python-multipart>=0.0.9
email-validator>=2.2.0
```

- [ ] **Step 2: Crear estructura de carpetas**

```bash
mkdir -p backend/core
mkdir -p backend/modules/auth
mkdir -p backend/modules/business
mkdir -p backend/modules/review
mkdir -p backend/modules/media
mkdir -p backend/modules/admin
mkdir -p backend/modules/meta
mkdir -p backend/modules/payments
mkdir -p tests/unit
mkdir -p tests/integration
```

```bash
# Crear __init__.py en cada directorio nuevo
touch backend/core/__init__.py
touch backend/modules/__init__.py
touch backend/modules/auth/__init__.py
touch backend/modules/business/__init__.py
touch backend/modules/review/__init__.py
touch backend/modules/media/__init__.py
touch backend/modules/admin/__init__.py
touch backend/modules/meta/__init__.py
touch backend/modules/payments/__init__.py
touch tests/__init__.py
touch tests/unit/__init__.py
touch tests/integration/__init__.py
```

- [ ] **Step 3: Crear README del módulo payments (placeholder Fase 2)**

Contenido de `backend/modules/payments/README.md`:
```markdown
# Payments Module (Fase 2)

Este módulo implementará la integración con Stripe para monetización.

## Features planificadas
- Listado destacado (featured)
- Plan Pro (más imágenes, estadísticas)
- Perfil verificado

## Dependencias a agregar
- stripe>=8.0.0
```

- [ ] **Step 4: Instalar dependencias**

```bash
cd backend && pip install -r requirements.txt
```

---

## Task 2: Core — Configuración, base de datos y seguridad JWT

**Files:**
- Create: `backend/core/config.py`
- Create: `backend/core/database.py`
- Create: `backend/core/security.py`
- Modify: `backend/.env` (agregar nuevas variables)

- [ ] **Step 1: Crear backend/core/config.py**

```python
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

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 2: Crear backend/core/database.py**

```python
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.config import settings

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]

async def close_db():
    global client
    if client:
        client.close()

def get_db() -> AsyncIOMotorDatabase:
    return db
```

- [ ] **Step 3: Crear backend/core/security.py**

```python
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_email_token(data: dict, expire_minutes: int = 60 * 24) -> str:
    """Token de corta duración para verificación de email y reset de contraseña."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    """Decodifica cualquier tipo de token. Lanza jwt.ExpiredSignatureError o jwt.InvalidTokenError si es inválido."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

- [ ] **Step 4: Actualizar .env con las nuevas variables**

Agregar al `backend/.env` existente:
```
# JWT
SECRET_KEY=genera-una-clave-segura-de-al-menos-32-caracteres

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@recomiendopymes.cl
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Admin seed
ADMIN_EMAIL=admin@recomiendopymes.cl
ADMIN_PASSWORD=cambia-esta-contrasena
ADMIN_EMAIL_2=admin2@recomiendopymes.cl
ADMIN_PASSWORD_2=cambia-esta-contrasena-2
```

---

## Task 3: Modelos compartidos (base)

**Files:**
- Modify: `backend/models.py` — conservar PyObjectId, limpiar el resto

- [ ] **Step 1: Reducir models.py a solo la base compartida**

```python
# backend/models.py — Solo PyObjectId compartido
from pydantic_core import core_schema
from typing import Any
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

# Config compartida para todos los modelos con ObjectId
MONGO_MODEL_CONFIG = {
    "populate_by_name": True,
    "arbitrary_types_allowed": True,
    "json_encoders": {ObjectId: str}
}
```

---

## Task 4: Módulo Auth — Modelos

**Files:**
- Create: `backend/modules/auth/models.py`
- Create: `tests/unit/test_auth_models.py`

- [ ] **Step 1: Escribir test de modelos de auth**

```python
# tests/unit/test_auth_models.py
import pytest
from modules.auth.models import UserCreate, UserLogin

def test_user_create_requires_email_and_password():
    user = UserCreate(email="test@test.cl", password="password123", name="Juan")
    assert user.email == "test@test.cl"
    assert user.name == "Juan"

def test_user_create_rejects_short_password():
    with pytest.raises(ValueError):
        UserCreate(email="test@test.cl", password="123", name="Juan")

def test_user_login_model():
    login = UserLogin(email="test@test.cl", password="password123")
    assert login.email == "test@test.cl"
```

- [ ] **Step 2: Ejecutar test (debe fallar)**

```bash
cd backend && python -m pytest ../tests/unit/test_auth_models.py -v
```
Expected: `ModuleNotFoundError`

- [ ] **Step 3: Crear backend/modules/auth/models.py**

```python
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="user")
    is_active: bool = True
    is_email_verified: bool = False

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = MONGO_MODEL_CONFIG

class UserPublic(BaseModel):
    """Versión pública del usuario (sin password_hash)"""
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
```

- [ ] **Step 4: Ejecutar test (debe pasar)**

```bash
cd backend && python -m pytest ../tests/unit/test_auth_models.py -v
```
Expected: PASS

---

## Task 5: Módulo Auth — Service (registro, login, email, reset)

**Files:**
- Create: `backend/modules/auth/service.py`
- Create: `tests/unit/test_auth_service.py`

- [ ] **Step 1: Escribir tests del auth service**

```python
# tests/unit/test_auth_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from modules.auth.models import UserCreate

@pytest.mark.asyncio
async def test_register_returns_user_and_token():
    mock_db = MagicMock()
    mock_db.users = AsyncMock()
    mock_db.users.find_one = AsyncMock(return_value=None)
    mock_db.users.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
    mock_db.users.find_one = AsyncMock(side_effect=[
        None,  # first call: check email exists
        {
            "_id": "507f1f77bcf86cd799439011",
            "email": "test@test.cl",
            "name": "Test",
            "role": "user",
            "is_active": True,
            "is_email_verified": False,
            "password_hash": "hashed",
            "created_at": "2024-01-01",
            "updated_at": "2024-01-01"
        }
    ])

    from modules.auth.service import AuthService
    with patch("modules.auth.service.send_verification_email", new_callable=AsyncMock):
        service = AuthService(mock_db)
        result = await service.register(UserCreate(
            email="test@test.cl",
            password="password123",
            name="Test"
        ))
    assert result.access_token is not None
    assert result.user.email == "test@test.cl"

@pytest.mark.asyncio
async def test_register_raises_if_email_exists():
    mock_db = MagicMock()
    mock_db.users = AsyncMock()
    mock_db.users.find_one = AsyncMock(return_value={"email": "test@test.cl"})

    from modules.auth.service import AuthService
    from fastapi import HTTPException
    service = AuthService(mock_db)
    with pytest.raises(HTTPException) as exc_info:
        await service.register(UserCreate(
            email="test@test.cl",
            password="password123",
            name="Test"
        ))
    assert exc_info.value.status_code == 400
```

- [ ] **Step 2: Ejecutar tests (deben fallar)**

```bash
cd backend && python -m pytest ../tests/unit/test_auth_service.py -v
```

- [ ] **Step 3: Crear backend/modules/auth/service.py**

```python
import resend
import jwt
from datetime import datetime, timezone
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from core.config import settings
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, create_email_token, decode_token
from modules.auth.models import UserCreate, UserLogin, TokenResponse, UserPublic, UserUpdate

resend.api_key = settings.RESEND_API_KEY

async def send_verification_email(email: str, name: str, token: str):
    """Envía email de verificación via Resend."""
    if not settings.RESEND_API_KEY:
        return  # Skip en dev sin API key
    verify_url = f"{settings.FRONTEND_URL}/verificar-email?token={token}"
    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Verifica tu email — RecomiendoPymes",
        "html": f"""
        <h2>Hola {name},</h2>
        <p>Gracias por registrarte en RecomiendoPymes.</p>
        <p>Por favor verifica tu email haciendo click en el siguiente enlace:</p>
        <a href="{verify_url}">Verificar mi email</a>
        <p>Este enlace expira en 24 horas.</p>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        """
    })

async def send_password_reset_email(email: str, name: str, token: str):
    """Envía email de reset de contraseña."""
    if not settings.RESEND_API_KEY:
        return
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Recuperar contraseña — RecomiendoPymes",
        "html": f"""
        <h2>Hola {name},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="{reset_url}">Restablecer contraseña</a>
        <p>Este enlace expira en 15 minutos. Si no solicitaste esto, ignora este email.</p>
        """
    })

def _doc_to_user_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc["name"],
        role=doc["role"],
        is_active=doc.get("is_active", True),
        is_email_verified=doc.get("is_email_verified", False),
        created_at=doc.get("created_at", datetime.utcnow())
    )

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users = db.users

    async def register(self, user_data: UserCreate) -> TokenResponse:
        # Verificar email único
        existing = await self.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Este email ya está registrado")

        # Crear usuario
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "password_hash": hash_password(user_data.password),
            "role": "user",
            "is_active": True,
            "is_email_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await self.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Enviar email de verificación
        verify_token = create_email_token({"sub": user_id, "purpose": "verify_email"}, expire_minutes=60*24)
        await send_verification_email(user_data.email, user_data.name, verify_token)

        # Retornar token de acceso
        doc = await self.users.find_one({"_id": result.inserted_id})
        access_token = create_access_token({"sub": user_id, "role": "user"})
        return TokenResponse(access_token=access_token, user=_doc_to_user_public(doc))

    async def login(self, credentials: UserLogin) -> TokenResponse:
        user = await self.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")

        access_token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
        return TokenResponse(access_token=access_token, user=_doc_to_user_public(user))

    async def verify_email(self, token: str) -> dict:
        try:
            payload = decode_token(token)
            if payload.get("purpose") != "verify_email":
                raise HTTPException(status_code=400, detail="Token inválido")
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail="El enlace de verificación ha expirado")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail="Token inválido")

        await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_email_verified": True, "updated_at": datetime.utcnow()}}
        )
        return {"message": "Email verificado correctamente"}

    async def resend_verification(self, user_id: str) -> dict:
        user = await self.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if user.get("is_email_verified"):
            return {"message": "Email ya verificado"}
        token = create_email_token({"sub": user_id, "purpose": "verify_email"}, expire_minutes=60*24)
        await send_verification_email(user["email"], user["name"], token)
        return {"message": "Email de verificación reenviado"}

    async def forgot_password(self, email: str) -> dict:
        user = await self.users.find_one({"email": email})
        # Por seguridad, siempre responder igual aunque el email no exista
        if user:
            token = create_email_token({"sub": str(user["_id"]), "purpose": "reset_password"}, expire_minutes=15)
            await send_password_reset_email(email, user["name"], token)
        return {"message": "Si el email existe, recibirás las instrucciones para restablecer tu contraseña"}

    async def reset_password(self, token: str, new_password: str) -> dict:
        try:
            payload = decode_token(token)
            if payload.get("purpose") != "reset_password":
                raise HTTPException(status_code=400, detail="Token inválido")
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail="El enlace ha expirado. Solicita uno nuevo.")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail="Token inválido")

        await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": hash_password(new_password), "updated_at": datetime.utcnow()}}
        )
        return {"message": "Contraseña actualizada correctamente"}

    async def update_profile(self, user_id: str, data: UserUpdate) -> UserPublic:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        await self.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        doc = await self.users.find_one({"_id": ObjectId(user_id)})
        return _doc_to_user_public(doc)
```

- [ ] **Step 4: Ejecutar tests (deben pasar)**

```bash
cd backend && python -m pytest ../tests/unit/test_auth_service.py -v
```

---

## Task 6: Módulo Auth — Dependencies y Router

**Files:**
- Create: `backend/modules/auth/dependencies.py`
- Create: `backend/modules/auth/router.py`

- [ ] **Step 1: Crear backend/modules/auth/dependencies.py**

```python
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from core.security import decode_token
from core.database import get_db

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada. Inicia sesión nuevamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Cuenta desactivada")
    return user

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acceso restringido a administradores")
    return current_user

async def require_verified(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_email_verified"):
        raise HTTPException(
            status_code=403,
            detail="Debes verificar tu email para realizar esta acción"
        )
    return current_user
```

- [ ] **Step 2: Crear backend/modules/auth/router.py**

```python
from fastapi import APIRouter, Depends, Response, Cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from core.config import settings
from core.security import create_refresh_token, decode_token
from modules.auth.models import UserCreate, UserLogin, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, UserUpdate
from modules.auth.service import AuthService
from modules.auth.dependencies import get_current_user
import jwt

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(user_data: UserCreate, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    result = await service.register(user_data)
    # Refresh token en cookie httpOnly
    refresh_token = create_refresh_token({"sub": result.user.id, "role": result.user.role})
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=True, samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return result

@router.post("/login")
async def login(credentials: UserLogin, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    result = await service.login(credentials)
    refresh_token = create_refresh_token({"sub": result.user.id, "role": result.user.role})
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=True, samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return result

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada correctamente"}

@router.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None), db: AsyncIOMotorDatabase = Depends(get_db)):
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="No hay sesión activa")
    try:
        payload = decode_token(refresh_token)
        user_id = payload["sub"]
        role = payload["role"]
    except jwt.InvalidTokenError:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Sesión inválida")

    from core.security import create_access_token
    access_token = create_access_token({"sub": user_id, "role": role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_email(token)

@router.post("/resend-verification")
async def resend_verification(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.resend_verification(str(current_user["_id"]))

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.forgot_password(request.email)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.reset_password(request.token, request.new_password)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    from modules.auth.service import _doc_to_user_public
    return _doc_to_user_public(current_user)

@router.put("/me")
async def update_me(data: UserUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AuthService(db)
    return await service.update_profile(str(current_user["_id"]), data)
```

---

## Task 7: Módulo Business — Modelos actualizados

**Files:**
- Create: `backend/modules/business/models.py`
- Create: `tests/unit/test_business_models.py`

- [ ] **Step 1: Escribir tests**

```python
# tests/unit/test_business_models.py
import pytest
from modules.business.models import BusinessCreate, Coordinates, SocialLinks

def test_business_create_requires_name_category_description():
    biz = BusinessCreate(
        name="Mi Tienda",
        category="Artesanía",
        description="Vendo artesanías hechas a mano en Chile",
        image="https://example.com/img.jpg",
        city="Santiago",
        owner="María José",
    )
    assert biz.name == "Mi Tienda"
    assert biz.status == "pending"
    assert biz.plan == "free"
    assert biz.featured is False

def test_coordinates_default_is_not_exact():
    coords = Coordinates(lat=-33.4489, lng=-70.6693)
    assert coords.is_exact is False

def test_social_links_all_optional():
    links = SocialLinks()
    assert links.instagram is None
    assert links.whatsapp is None
```

- [ ] **Step 2: Ejecutar test (debe fallar)**

```bash
cd backend && python -m pytest ../tests/unit/test_business_models.py -v
```

- [ ] **Step 3: Crear backend/modules/business/models.py**

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG

class SocialLinks(BaseModel):
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    tiktok: Optional[str] = None
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None  # correo de contacto público

class Coordinates(BaseModel):
    lat: float
    lng: float
    is_exact: bool = False

class BusinessBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=10, max_length=1000)
    image: str = Field(default="")
    gallery: List[str] = Field(default_factory=list)
    social_links: SocialLinks = Field(default_factory=SocialLinks)
    owner: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(default="online", description="online | physical | both")
    delivery_type: str = Field(default="nationwide", description="local | nationwide | pickup_only | local_and_pickup")
    established: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None

class BusinessCreate(BusinessBase):
    status: str = "pending"
    plan: str = "free"
    featured: bool = False

class BusinessUpdate(BaseModel):
    """Todos los campos son opcionales. El nombre NO se incluye (afecta slug SEO)."""
    category: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    gallery: Optional[List[str]] = None
    social_links: Optional[SocialLinks] = None
    owner: Optional[str] = None
    business_type: Optional[str] = None
    delivery_type: Optional[str] = None
    established: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None

class Business(BusinessBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    slug: str = ""
    owner_user_id: Optional[PyObjectId] = None
    status: str = "pending"
    activated_at: Optional[datetime] = None
    rating: float = 0.0
    review_count: int = 0
    view_count: int = 0
    # Monetización (Fase 2) — campos listos, no funcionales aún
    featured: bool = False
    featured_until: Optional[datetime] = None
    is_verified: bool = False
    plan: str = "free"
    plan_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = MONGO_MODEL_CONFIG

class BusinessListResponse(BaseModel):
    businesses: List[Business]
    total: int
    page: int
    total_pages: int

class BusinessDetailResponse(BaseModel):
    business: Business
    reviews: List[dict]
```

- [ ] **Step 4: Ejecutar test (debe pasar)**

```bash
cd backend && python -m pytest ../tests/unit/test_business_models.py -v
```

---

## Task 8: Módulo Business — Service (CRUD + slug + geocodificación + ordenamiento)

**Files:**
- Create: `backend/modules/business/service.py`
- Create: `tests/unit/test_business_service.py`

- [ ] **Step 1: Escribir tests**

```python
# tests/unit/test_business_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.mark.asyncio
async def test_generate_slug_unique():
    mock_db = MagicMock()
    mock_db.businesses = AsyncMock()
    # Primera llamada: slug existe. Segunda: slug-2 no existe.
    mock_db.businesses.find_one = AsyncMock(side_effect=[
        {"slug": "mi-tienda"}, None
    ])

    from modules.business.service import BusinessService
    service = BusinessService(mock_db)
    slug = await service._generate_unique_slug("Mi Tienda")
    assert slug == "mi-tienda-2"

@pytest.mark.asyncio
async def test_generate_slug_no_collision():
    mock_db = MagicMock()
    mock_db.businesses = AsyncMock()
    mock_db.businesses.find_one = AsyncMock(return_value=None)

    from modules.business.service import BusinessService
    service = BusinessService(mock_db)
    slug = await service._generate_unique_slug("Artesanías María José")
    assert slug == "artesanias-maria-jose"
```

- [ ] **Step 2: Ejecutar test (debe fallar)**

```bash
cd backend && python -m pytest ../tests/unit/test_business_service.py -v
```

- [ ] **Step 3: Crear backend/modules/business/service.py**

```python
from slugify import slugify
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException
from modules.business.models import Business, BusinessCreate, BusinessUpdate

# Coordenadas de centros de ciudades principales de Chile
CHILE_CITY_CENTERS = {
    "Santiago": {"lat": -33.4489, "lng": -70.6693},
    "Valparaíso": {"lat": -33.0472, "lng": -71.6127},
    "Concepción": {"lat": -36.8201, "lng": -73.0444},
    "La Serena": {"lat": -29.9027, "lng": -71.2519},
    "Antofagasta": {"lat": -23.6509, "lng": -70.3975},
    "Temuco": {"lat": -38.7359, "lng": -72.5904},
    "Rancagua": {"lat": -34.1708, "lng": -70.7444},
    "Talca": {"lat": -35.4264, "lng": -71.6554},
    "Arica": {"lat": -18.4783, "lng": -70.3126},
    "Iquique": {"lat": -20.2141, "lng": -70.1522},
    "Puerto Montt": {"lat": -41.4693, "lng": -72.9424},
    "Coyhaique": {"lat": -45.5712, "lng": -72.0688},
    "Punta Arenas": {"lat": -53.1638, "lng": -70.9171},
}

class BusinessService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.businesses = db.businesses

    async def create_indexes(self):
        await self.businesses.create_index([
            ("name", "text"), ("description", "text"),
            ("category", "text"), ("city", "text")
        ])
        await self.businesses.create_index("category")
        await self.businesses.create_index("city")
        await self.businesses.create_index("slug", unique=True)
        await self.businesses.create_index("status")
        await self.businesses.create_index("owner_user_id")
        await self.businesses.create_index([("rating", -1)])

    async def _generate_unique_slug(self, name: str) -> str:
        base_slug = slugify(name, allow_unicode=False)
        slug = base_slug
        counter = 2
        while await self.businesses.find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def _get_city_coordinates(self, city: str) -> dict:
        coords = CHILE_CITY_CENTERS.get(city, {"lat": -33.4489, "lng": -70.6693})
        return {"lat": coords["lat"], "lng": coords["lng"], "is_exact": False}

    def _doc_to_business(self, doc: dict) -> Business:
        doc["_id"] = str(doc["_id"])
        if doc.get("owner_user_id"):
            doc["owner_user_id"] = str(doc["owner_user_id"])
        return Business(**doc)

    async def get_businesses(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 12
    ) -> Dict[str, Any]:
        query = {"status": "active"}

        if category and category != "Todas":
            query["category"] = category
        if city and city != "Todas las ciudades":
            query["city"] = city
        if search:
            pattern = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"name": pattern}, {"description": pattern},
                {"category": pattern}, {"city": pattern}
            ]

        total = await self.businesses.count_documents(query)
        skip = (page - 1) * limit
        now = datetime.now(timezone.utc)
        boost_days = 30  # En Fase 2, leer desde Config collection

        # Ordenamiento: destacados → nuevos sin reseñas → con reseñas → sin reseñas viejos
        pipeline = [
            {"$match": query},
            {"$addFields": {
                "_sort_group": {
                    "$switch": {
                        "branches": [
                            # Grupo 0: destacados vigentes
                            {"case": {
                                "$and": [
                                    {"$eq": ["$featured", True]},
                                    {"$or": [
                                        {"$eq": ["$featured_until", None]},
                                        {"$gt": ["$featured_until", now]}
                                    ]}
                                ]
                            }, "then": 0},
                            # Grupo 1: sin reseñas + nuevos (< boost_days días)
                            {"case": {
                                "$and": [
                                    {"$eq": ["$review_count", 0]},
                                    {"$gte": ["$activated_at", datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=boost_days)]}
                                ]
                            }, "then": 1},
                            # Grupo 2: con reseñas
                            {"case": {"$gt": ["$review_count", 0]}, "then": 2},
                        ],
                        "default": 3  # sin reseñas viejos
                    }
                }
            }},
            {"$sort": {"_sort_group": 1, "rating": -1, "activated_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]

        cursor = self.businesses.aggregate(pipeline)
        businesses = []
        async for doc in cursor:
            businesses.append(self._doc_to_business(doc))

        return {
            "businesses": businesses,
            "total": total,
            "page": page,
            "total_pages": max(1, (total + limit - 1) // limit)
        }

    async def get_by_slug(self, slug: str) -> Optional[Business]:
        doc = await self.businesses.find_one({"slug": slug, "status": "active"})
        if doc:
            return self._doc_to_business(doc)
        return None

    async def get_by_id(self, business_id: str) -> Optional[Business]:
        if not ObjectId.is_valid(business_id):
            return None
        doc = await self.businesses.find_one({"_id": ObjectId(business_id)})
        if doc:
            return self._doc_to_business(doc)
        return None

    async def get_by_owner(self, owner_user_id: str) -> List[Business]:
        """Obtiene todos los negocios de un usuario."""
        cursor = self.businesses.find({"owner_user_id": ObjectId(owner_user_id)})
        businesses = []
        async for doc in cursor:
            businesses.append(self._doc_to_business(doc))
        return businesses

    async def create(self, data: BusinessCreate, owner_user_id: Optional[str] = None) -> Business:
        slug = await self._generate_unique_slug(data.name)
        coords = data.coordinates
        if not coords:
            city_coords = self._get_city_coordinates(data.city)
            from modules.business.models import Coordinates
            coords = Coordinates(**city_coords)

        doc = data.dict(exclude={"coordinates"})
        doc["slug"] = slug
        doc["coordinates"] = coords.dict() if coords else None
        doc["owner_user_id"] = ObjectId(owner_user_id) if owner_user_id else None
        doc["status"] = "pending"
        doc["rating"] = 0.0
        doc["review_count"] = 0
        doc["view_count"] = 0
        doc["activated_at"] = None
        doc["featured"] = False
        doc["featured_until"] = None
        doc["is_verified"] = False
        doc["plan"] = "free"
        doc["plan_expires_at"] = None
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()

        result = await self.businesses.insert_one(doc)
        return await self.get_by_id(str(result.inserted_id))

    async def update(self, business_id: str, data: BusinessUpdate, requesting_user_id: str, is_admin: bool = False) -> Optional[Business]:
        business = await self.get_by_id(business_id)
        if not business:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        # Solo el dueño o admin pueden editar
        if not is_admin and str(business.owner_user_id) != requesting_user_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para editar este emprendimiento")

        update_data = {k: v for k, v in data.dict().items() if v is not None}

        # Si cambia la ciudad y no se provee coordenadas, actualizar a centro de ciudad
        if "city" in update_data and "coordinates" not in update_data:
            city_coords = self._get_city_coordinates(update_data["city"])
            update_data["coordinates"] = city_coords

        if "coordinates" in update_data and isinstance(update_data["coordinates"], dict):
            pass  # Ya es dict

        update_data["updated_at"] = datetime.utcnow()
        await self.businesses.update_one({"_id": ObjectId(business_id)}, {"$set": update_data})
        return await self.get_by_id(business_id)

    async def change_status(self, business_id: str, new_status: str, requesting_user_id: str, is_admin: bool = False) -> Business:
        """
        Transiciones permitidas:
        - Admin: pending→active, pending→inactive, active→inactive, inactive→active
        - Emprendedor: active→inactive (desactivar), inactive→pending (solicitar reactivación)
        """
        business = await self.get_by_id(business_id)
        if not business:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        current = business.status
        is_owner = str(business.owner_user_id) == requesting_user_id

        if not is_admin and not is_owner:
            raise HTTPException(status_code=403, detail="Sin permisos")

        allowed_transitions_entrepreneur = {
            "active": ["inactive"],
            "inactive": ["pending"],
        }
        allowed_transitions_admin = {
            "pending": ["active", "inactive"],
            "active": ["inactive"],
            "inactive": ["active", "pending"],
        }

        allowed = allowed_transitions_admin.get(current, []) if is_admin else allowed_transitions_entrepreneur.get(current, [])
        if new_status not in allowed:
            raise HTTPException(status_code=400, detail=f"Transición de estado '{current}' → '{new_status}' no permitida")

        update = {"status": new_status, "updated_at": datetime.utcnow()}
        if new_status == "active" and current != "active":
            update["activated_at"] = datetime.utcnow()

        await self.businesses.update_one({"_id": ObjectId(business_id)}, {"$set": update})
        return await self.get_by_id(business_id)

    async def increment_view_count(self, business_id: str):
        await self.businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$inc": {"view_count": 1}}
        )

    async def delete(self, business_id: str) -> bool:
        if not ObjectId.is_valid(business_id):
            return False
        await self.db.reviews.delete_many({"business_id": ObjectId(business_id)})
        result = await self.businesses.delete_one({"_id": ObjectId(business_id)})
        return result.deleted_count > 0

    async def get_categories(self) -> List[str]:
        cats = await self.businesses.distinct("category", {"status": "active"})
        return ["Todas"] + sorted(cats)

    async def get_cities(self) -> List[str]:
        cities = await self.businesses.distinct("city", {"status": "active"})
        return ["Todas las ciudades"] + sorted([c for c in cities if c])

    async def update_rating(self, business_id: str):
        pipeline = [
            {"$match": {"business_id": ObjectId(business_id), "is_visible": True}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        result = []
        async for doc in self.db.reviews.aggregate(pipeline):
            result.append(doc)

        avg = round(result[0]["avg"], 1) if result else 0.0
        count = result[0]["count"] if result else 0
        await self.businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {"rating": avg, "review_count": count, "updated_at": datetime.utcnow()}}
        )
```

- [ ] **Step 4: Ejecutar tests**

```bash
cd backend && python -m pytest ../tests/unit/test_business_service.py -v
```

- [ ] **Step 5: 🧹 Eliminar business_service.py heredado**

El servicio antiguo ha sido reemplazado completamente por `modules/business/service.py`.

```bash
# Verificar que el módulo nuevo funciona antes de borrar
python -c "from modules.business.service import BusinessService; print('OK')"

# Borrar el archivo heredado y el directorio si queda vacío
Remove-Item -Path backend\services\business_service.py -Force
Remove-Item -Path backend\services -Force # Solo si está vacío
```

Expected: el directorio `backend/services/` ya no existe.

---

## Task 9: Módulo Business — Router

**Files:**
- Create: `backend/modules/business/router.py`

- [ ] **Step 1: Crear backend/modules/business/router.py**

```python
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.business.models import BusinessCreate, BusinessUpdate, BusinessListResponse, BusinessDetailResponse
from modules.business.service import BusinessService
from modules.auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/businesses", tags=["businesses"])

@router.get("", response_model=BusinessListResponse)
async def list_businesses(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    result = await service.get_businesses(category=category, city=city, search=search, page=page, limit=limit)
    return BusinessListResponse(**result)

@router.get("/mine")
async def my_businesses(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Obtiene todos los negocios del usuario autenticado."""
    service = BusinessService(db)
    return await service.get_by_owner(str(current_user["_id"]))

@router.get("/{slug_or_id}")
async def get_business(slug_or_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = BusinessService(db)
    # Intentar primero por slug, luego por ID
    business = await service.get_by_slug(slug_or_id)
    if not business:
        business = await service.get_by_id(slug_or_id)
    if not business:
        raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

    await service.increment_view_count(str(business.id))

    reviews_data = await db.reviews.find(
        {"business_id": business.id, "is_visible": True}
    ).sort("date", -1).to_list(50)
    for r in reviews_data:
        r["_id"] = str(r["_id"])
        r["business_id"] = str(r["business_id"])
        if r.get("reviewer_user_id"):
            r["reviewer_user_id"] = str(r["reviewer_user_id"])

    return BusinessDetailResponse(business=business, reviews=reviews_data)

@router.post("")
async def create_business(
    data: BusinessCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    return await service.create(data, owner_user_id=str(current_user["_id"]))

@router.put("/{business_id}")
async def update_business(
    business_id: str,
    data: BusinessUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    is_admin = current_user.get("role") == "admin"
    return await service.update(business_id, data, str(current_user["_id"]), is_admin)

@router.patch("/{business_id}/status")
async def change_status(
    business_id: str,
    new_status: str = Query(..., description="pending | active | inactive"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    is_admin = current_user.get("role") == "admin"
    return await service.change_status(business_id, new_status, str(current_user["_id"]), is_admin)

@router.delete("/{business_id}")
async def delete_business(
    business_id: str,
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BusinessService(db)
    success = await service.delete(business_id)
    if not success:
        raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")
    return {"message": "Emprendimiento eliminado correctamente"}
```

---

## Task 10: Módulo Review — Modelos y Service (con detección sospechosos)

**Files:**
- Create: `backend/modules/review/models.py`
- Create: `backend/modules/review/service.py`
- Create: `backend/modules/review/router.py`
- Create: `tests/unit/test_review_service.py`

- [ ] **Step 1: Crear backend/modules/review/models.py**

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG

class ReviewResponse(BaseModel):
    """Respuesta del emprendedor a una reseña."""
    text: str = Field(..., min_length=5, max_length=500)
    date: datetime = Field(default_factory=datetime.utcnow)
    responder_user_id: Optional[str] = None

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=10, max_length=500)

class ReviewResponseCreate(BaseModel):
    text: str = Field(..., min_length=5, max_length=500)

class Review(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    reviewer_user_id: PyObjectId
    reviewer_name: str
    rating: int
    text: str
    is_visible: bool = True
    flagged: bool = False
    response: Optional[ReviewResponse] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = MONGO_MODEL_CONFIG

class ReviewListResponse(BaseModel):
    reviews: List[Review]
    total: int
```

- [ ] **Step 2: Escribir test de detección de sospechosos**

```python
# tests/unit/test_review_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock

@pytest.mark.asyncio
async def test_detect_suspicious_same_rating_many_businesses():
    """Si el usuario pone el mismo rating en N negocios en X horas, debe detectarse como sospechoso."""
    mock_db = MagicMock()
    mock_db.reviews = AsyncMock()
    # Simular que el usuario ya tiene 5 reseñas con rating 5 en las últimas 2 horas
    mock_db.reviews.count_documents = AsyncMock(return_value=5)

    from modules.review.service import ReviewService
    service = ReviewService(mock_db)

    # Config: suspicious_count=5, window_hours=2
    is_suspicious = await service._is_suspicious_review(
        user_id="user123", rating=5,
        suspicious_count=5, window_hours=2
    )
    assert is_suspicious is True

@pytest.mark.asyncio
async def test_not_suspicious_below_threshold():
    mock_db = MagicMock()
    mock_db.reviews = AsyncMock()
    mock_db.reviews.count_documents = AsyncMock(return_value=2)

    from modules.review.service import ReviewService
    service = ReviewService(mock_db)

    is_suspicious = await service._is_suspicious_review(
        user_id="user123", rating=5,
        suspicious_count=5, window_hours=2
    )
    assert is_suspicious is False
```

- [ ] **Step 3: Crear backend/modules/review/service.py**

```python
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException
from modules.review.models import ReviewCreate, ReviewResponseCreate

class ReviewService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.reviews = db.reviews

    async def _get_config(self, key: str, default):
        """Lee configuración desde la colección config."""
        doc = await self.db.config.find_one({"key": key})
        return doc["value"] if doc else default

    async def _is_suspicious_review(self, user_id: str, rating: int, suspicious_count: int = None, window_hours: int = None) -> bool:
        if suspicious_count is None:
            suspicious_count = await self._get_config("suspicious_review_count", 5)
        if window_hours is None:
            window_hours = await self._get_config("suspicious_review_window_hours", 2)

        since = datetime.utcnow() - timedelta(hours=window_hours)
        count = await self.reviews.count_documents({
            "reviewer_user_id": ObjectId(user_id),
            "rating": rating,
            "date": {"$gte": since}
        })
        return count >= suspicious_count

    async def create_review(self, business_id: str, user: dict, data: ReviewCreate) -> dict:
        user_id = str(user["_id"])

        # Verificar que el negocio existe y está activo
        business = await self.db.businesses.find_one({"_id": ObjectId(business_id), "status": "active"})
        if not business:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        # Verificar que no es dueño del negocio
        if business.get("owner_user_id") and str(business["owner_user_id"]) == user_id:
            raise HTTPException(status_code=400, detail="No puedes reseñar tu propio emprendimiento")

        # Verificar que no tiene reseña previa en este negocio
        existing = await self.reviews.find_one({
            "business_id": ObjectId(business_id),
            "reviewer_user_id": ObjectId(user_id)
        })
        if existing:
            raise HTTPException(status_code=400, detail="Ya dejaste una reseña en este emprendimiento")

        # Detectar comportamiento sospechoso
        is_suspicious = await self._is_suspicious_review(user_id, data.rating)

        review_doc = {
            "business_id": ObjectId(business_id),
            "reviewer_user_id": ObjectId(user_id),
            "reviewer_name": user["name"],
            "rating": data.rating,
            "text": data.text,
            "is_visible": True,
            "flagged": is_suspicious,
            "response": None,
            "date": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        result = await self.reviews.insert_one(review_doc)

        # Actualizar rating del negocio
        from modules.business.service import BusinessService
        biz_service = BusinessService(self.db)
        await biz_service.update_rating(business_id)

        doc = await self.reviews.find_one({"_id": result.inserted_id})
        doc["_id"] = str(doc["_id"])
        doc["business_id"] = str(doc["business_id"])
        doc["reviewer_user_id"] = str(doc["reviewer_user_id"])
        return doc

    async def add_response(self, review_id: str, owner_user_id: str, data: ReviewResponseCreate) -> dict:
        review = await self.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Reseña no encontrada")

        business = await self.db.businesses.find_one({"_id": review["business_id"]})
        if not business or str(business.get("owner_user_id")) != owner_user_id:
            raise HTTPException(status_code=403, detail="Solo el dueño puede responder esta reseña")

        response_doc = {
            "text": data.text,
            "date": datetime.utcnow(),
            "responder_user_id": ObjectId(owner_user_id)
        }
        await self.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"response": response_doc}}
        )
        doc = await self.reviews.find_one({"_id": ObjectId(review_id)})
        doc["_id"] = str(doc["_id"])
        doc["business_id"] = str(doc["business_id"])
        doc["reviewer_user_id"] = str(doc["reviewer_user_id"])
        return doc

    async def get_business_reviews(self, business_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        query = {"business_id": ObjectId(business_id), "is_visible": True}
        total = await self.reviews.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.reviews.find(query).sort("date", -1).skip(skip).limit(limit)
        reviews = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["business_id"] = str(doc["business_id"])
            doc["reviewer_user_id"] = str(doc["reviewer_user_id"])
            reviews.append(doc)
        return {"reviews": reviews, "total": total}
```

- [ ] **Step 4: Crear backend/modules/review/router.py**

```python
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.review.models import ReviewCreate, ReviewResponseCreate
from modules.review.service import ReviewService
from modules.auth.dependencies import get_current_user, require_verified

router = APIRouter(tags=["reviews"])

@router.get("/api/businesses/{business_id}/reviews")
async def get_reviews(
    business_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.get_business_reviews(business_id, page, limit)

@router.post("/api/businesses/{business_id}/reviews")
async def create_review(
    business_id: str,
    data: ReviewCreate,
    current_user: dict = Depends(require_verified),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.create_review(business_id, current_user, data)

@router.post("/api/reviews/{review_id}/response")
async def add_response(
    review_id: str,
    data: ReviewResponseCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ReviewService(db)
    return await service.add_response(review_id, str(current_user["_id"]), data)
```

- [ ] **Step 5: Ejecutar tests de review**

```bash
cd backend && python -m pytest ../tests/unit/test_review_service.py -v
```

---

## Task 11: Módulo Media — Cloudinary

**Files:**
- Create: `backend/modules/media/service.py`
- Create: `backend/modules/media/router.py`

- [ ] **Step 1: Crear backend/modules/media/service.py**

```python
import cloudinary
import cloudinary.uploader
from core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def generate_upload_signature(folder: str = "businesses") -> dict:
    """
    Genera una firma para upload directo desde el browser a Cloudinary.
    El frontend usa esta firma para subir sin pasar por el servidor.
    """
    import time
    timestamp = int(time.time())
    transformation = "c_limit,w_1200,f_webp,q_auto"

    params_to_sign = {
        "folder": folder,
        "timestamp": timestamp,
        "transformation": transformation
    }

    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.CLOUDINARY_API_SECRET)

    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "api_key": settings.CLOUDINARY_API_KEY,
        "folder": folder,
        "transformation": transformation
    }

def delete_image(public_id: str) -> dict:
    """Elimina una imagen de Cloudinary."""
    return cloudinary.uploader.destroy(public_id)
```

- [ ] **Step 2: Crear backend/modules/media/router.py**

```python
from fastapi import APIRouter, Depends
from modules.media.service import generate_upload_signature
from modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/media", tags=["media"])

@router.get("/upload-signature")
async def get_upload_signature(current_user: dict = Depends(get_current_user)):
    """
    Retorna firma para upload directo al browser a Cloudinary.
    Solo usuarios autenticados pueden obtener la firma.
    """
    return generate_upload_signature(folder="businesses")
```

---

## Task 12: Módulo Meta — Categorías y Ciudades

**Files:**
- Create: `backend/modules/meta/models.py`
- Create: `backend/modules/meta/service.py`
- Create: `backend/modules/meta/router.py`

- [ ] **Step 1: Crear backend/modules/meta/models.py**

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from models import PyObjectId, MONGO_MODEL_CONFIG

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    icon: Optional[str] = None

class Category(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    slug: str
    icon: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    model_config = MONGO_MODEL_CONFIG
```

- [ ] **Step 2: Crear backend/modules/meta/service.py**

```python
from slugify import slugify
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from modules.meta.models import Category, CategoryCreate

class MetaService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_categories(self) -> list:
        cursor = self.db.categories.find({}).sort("name", 1)
        cats = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            cats.append(doc)
        return ["Todas"] + [c["name"] for c in cats]

    async def create_category(self, data: CategoryCreate) -> Category:
        slug = slugify(data.name)
        existing = await self.db.categories.find_one({"slug": slug})
        if existing:
            raise HTTPException(status_code=400, detail="Esta categoría ya existe")
        doc = {"name": data.name, "slug": slug, "icon": data.icon, "created_at": datetime.utcnow()}
        result = await self.db.categories.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return Category(**doc)

    async def delete_category(self, category_id: str) -> dict:
        result = await self.db.categories.delete_one({"_id": ObjectId(category_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return {"message": "Categoría eliminada"}

    async def get_cities(self) -> list:
        """Obtiene ciudades únicas de negocios activos."""
        cities = await self.db.businesses.distinct("city", {"status": "active"})
        return ["Todas las ciudades"] + sorted([c for c in cities if c])

    async def get_sitemap_urls(self) -> list:
        """URLs para el sitemap.xml."""
        cursor = self.db.businesses.find({"status": "active"}, {"slug": 1})
        slugs = []
        async for doc in cursor:
            if doc.get("slug"):
                slugs.append(doc["slug"])
        return slugs
```

- [ ] **Step 3: Crear backend/modules/meta/router.py**

```python
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from core.config import settings
from modules.meta.models import CategoryCreate
from modules.meta.service import MetaService
from modules.auth.dependencies import require_admin

router = APIRouter(tags=["meta"])

@router.get("/api/categories")
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_db)):
    service = MetaService(db)
    return {"categories": await service.get_categories()}

@router.post("/api/categories")
async def create_category(data: CategoryCreate, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = MetaService(db)
    return await service.create_category(data)

@router.delete("/api/categories/{category_id}")
async def delete_category(category_id: str, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = MetaService(db)
    return await service.delete_category(category_id)

@router.get("/api/cities")
async def get_cities(db: AsyncIOMotorDatabase = Depends(get_db)):
    service = MetaService(db)
    return {"cities": await service.get_cities()}

@router.get("/sitemap.xml")
async def sitemap(db: AsyncIOMotorDatabase = Depends(get_db)):
    service = MetaService(db)
    slugs = await service.get_sitemap_urls()
    base_url = settings.FRONTEND_URL
    urls_xml = "\n".join([
        f"  <url><loc>{base_url}/emprendimiento/{slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>"
        for slug in slugs
    ])
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{base_url}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>{base_url}/mapa</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
{urls_xml}
</urlset>"""
    return Response(content=xml, media_type="application/xml")
```

---

## Task 13: Módulo Admin — Service y Router

**Files:**
- Create: `backend/modules/admin/service.py`
- Create: `backend/modules/admin/router.py`

- [ ] **Step 1: Crear backend/modules/admin/service.py**

```python
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi import HTTPException

class AdminService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_dashboard_metrics(self) -> dict:
        total_businesses = await self.db.businesses.count_documents({})
        pending = await self.db.businesses.count_documents({"status": "pending"})
        active = await self.db.businesses.count_documents({"status": "active"})
        inactive = await self.db.businesses.count_documents({"status": "inactive"})
        total_users = await self.db.users.count_documents({})
        total_reviews = await self.db.reviews.count_documents({})
        flagged_reviews = await self.db.reviews.count_documents({"flagged": True, "is_visible": True})

        last_30_days = datetime.utcnow() - timedelta(days=30)
        new_businesses = await self.db.businesses.count_documents({"created_at": {"$gte": last_30_days}})
        new_users = await self.db.users.count_documents({"created_at": {"$gte": last_30_days}})
        new_reviews = await self.db.reviews.count_documents({"created_at": {"$gte": last_30_days}})

        # Top categorías
        pipeline = [
            {"$match": {"status": "active"}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        top_categories = []
        async for doc in self.db.businesses.aggregate(pipeline):
            top_categories.append({"category": doc["_id"], "count": doc["count"]})

        return {
            "businesses": {"total": total_businesses, "pending": pending, "active": active, "inactive": inactive, "new_last_30_days": new_businesses},
            "users": {"total": total_users, "new_last_30_days": new_users},
            "reviews": {"total": total_reviews, "flagged": flagged_reviews, "new_last_30_days": new_reviews},
            "top_categories": top_categories
        }

    async def get_businesses(self, status: str = None, page: int = 1, limit: int = 20) -> dict:
        query = {}
        if status:
            query["status"] = status
        total = await self.db.businesses.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.businesses.find(query).sort("created_at", -1).skip(skip).limit(limit)
        businesses = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if doc.get("owner_user_id"):
                doc["owner_user_id"] = str(doc["owner_user_id"])
            businesses.append(doc)
        return {"businesses": businesses, "total": total, "page": page, "total_pages": max(1, (total + limit - 1) // limit)}

    async def get_reviews(self, flagged_only: bool = False, page: int = 1, limit: int = 20) -> dict:
        query = {}
        if flagged_only:
            query["flagged"] = True
        total = await self.db.reviews.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.reviews.find(query).sort("date", -1).skip(skip).limit(limit)
        reviews = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["business_id"] = str(doc["business_id"])
            doc["reviewer_user_id"] = str(doc["reviewer_user_id"])
            reviews.append(doc)
        return {"reviews": reviews, "total": total, "page": page, "total_pages": max(1, (total + limit - 1) // limit)}

    async def toggle_review_visibility(self, review_id: str) -> dict:
        review = await self.db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Reseña no encontrada")
        new_visibility = not review.get("is_visible", True)
        await self.db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"is_visible": new_visibility}}
        )
        # Recalcular rating del negocio
        from modules.business.service import BusinessService
        biz_service = BusinessService(self.db)
        await biz_service.update_rating(str(review["business_id"]))
        return {"message": "Visibilidad actualizada", "is_visible": new_visibility}

    async def get_users(self, page: int = 1, limit: int = 20) -> dict:
        total = await self.db.users.count_documents({})
        skip = (page - 1) * limit
        cursor = self.db.users.find({}, {"password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit)
        users = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            users.append(doc)
        return {"users": users, "total": total, "page": page, "total_pages": max(1, (total + limit - 1) // limit)}

    async def toggle_user_active(self, user_id: str) -> dict:
        user = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if user.get("role") == "admin":
            raise HTTPException(status_code=400, detail="No se puede desactivar a un administrador")

        new_active = not user.get("is_active", True)
        await self.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_active}})

        # Si se desactiva: ocultar reseñas y negocios en cascada
        if not new_active:
            await self.db.reviews.update_many(
                {"reviewer_user_id": ObjectId(user_id)},
                {"$set": {"is_visible": False}}
            )
            await self.db.businesses.update_many(
                {"owner_user_id": ObjectId(user_id)},
                {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
            )
            # Recalcular ratings de los negocios afectados
            from modules.business.service import BusinessService
            biz_service = BusinessService(self.db)
            cursor = self.db.businesses.find({"owner_user_id": ObjectId(user_id)})
            async for biz in cursor:
                await biz_service.update_rating(str(biz["_id"]))

        return {"message": f"Usuario {'desactivado' if not new_active else 'activado'}", "is_active": new_active}

    async def promote_to_admin(self, user_id: str) -> dict:
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": "admin", "updated_at": datetime.utcnow()}}
        )
        return {"message": "Usuario promovido a administrador"}

    async def get_legal_content(self, key: str) -> dict:
        doc = await self.db.legal_pages.find_one({"key": key})
        if not doc:
            return {"key": key, "content": "", "updated_at": None}
        doc["_id"] = str(doc["_id"])
        return doc

    async def update_legal_content(self, key: str, content: str) -> dict:
        await self.db.legal_pages.update_one(
            {"key": key},
            {"$set": {"key": key, "content": content, "updated_at": datetime.utcnow()}},
            upsert=True
        )
        return {"message": "Contenido actualizado correctamente"}

    async def get_config(self) -> list:
        cursor = self.db.config.find({})
        configs = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            configs.append(doc)
        return configs

    async def update_config(self, key: str, value) -> dict:
        await self.db.config.update_one(
            {"key": key},
            {"$set": {"value": value, "updated_at": datetime.utcnow()}},
            upsert=True
        )
        return {"message": f"Configuración '{key}' actualizada"}
```

- [ ] **Step 2: Crear backend/modules/admin/router.py**

```python
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.database import get_db
from modules.admin.service import AdminService
from modules.auth.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/dashboard")
async def dashboard(_: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.get_dashboard_metrics()

@router.get("/businesses")
async def list_businesses(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_businesses(status, page, limit)

@router.get("/reviews")
async def list_reviews(
    flagged_only: bool = Query(False),
    page: int = Query(1, ge=1),
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = AdminService(db)
    return await service.get_reviews(flagged_only, page)

@router.patch("/reviews/{review_id}/visibility")
async def toggle_visibility(review_id: str, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.toggle_review_visibility(review_id)

@router.get("/users")
async def list_users(page: int = Query(1, ge=1), _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.get_users(page)

@router.patch("/users/{user_id}/toggle-active")
async def toggle_user(user_id: str, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.toggle_user_active(user_id)

@router.patch("/users/{user_id}/promote")
async def promote(user_id: str, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.promote_to_admin(user_id)

@router.get("/legal/{key}")
async def get_legal(key: str, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.get_legal_content(key)

@router.put("/legal/{key}")
async def update_legal(key: str, body: dict, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.update_legal_content(key, body.get("content", ""))

@router.get("/config")
async def get_config(_: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.get_config()

@router.put("/config/{key}")
async def update_config(key: str, body: dict, _: dict = Depends(require_admin), db: AsyncIOMotorDatabase = Depends(get_db)):
    service = AdminService(db)
    return await service.update_config(key, body.get("value"))
```

---

## Task 14: App Factory — server.py actualizado + indexes

**Files:**
- Modify: `backend/server.py`

- [ ] **Step 1: Reescribir backend/server.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import connect_db, close_db, get_db
from modules.auth.router import router as auth_router
from modules.business.router import router as business_router
from modules.review.router import router as review_router
from modules.media.router import router as media_router
from modules.admin.router import router as admin_router
from modules.meta.router import router as meta_router
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="RecomiendoPymes API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()
    db = get_db()
    # Crear índices
    from modules.business.service import BusinessService
    await BusinessService(db).create_indexes()
    await db.reviews.create_index("business_id")
    await db.reviews.create_index("reviewer_user_id")
    await db.reviews.create_index([("flagged", 1), ("is_visible", 1)])
    await db.users.create_index("email", unique=True)
    await db.categories.create_index("slug", unique=True)
    logger.info("Startup completo — índices creados")

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# Registrar routers
app.include_router(auth_router)
app.include_router(business_router)
app.include_router(review_router)
app.include_router(media_router)
app.include_router(admin_router)
app.include_router(meta_router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
```

---

## Task 15: Seed data en español con admins

**Files:**
- Modify: `backend/seed_data.py`

- [ ] **Step 1: Reescribir seed_data.py con datos chilenos + admins + config inicial**

```python
"""
Seed data para RecomiendoPymes — datos de prueba en español (Chile)
Ejecutar con: python seed_data.py
"""
import asyncio
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

from core.security import hash_password

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "recomiendopymes")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@recomiendopymes.cl")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme123")
ADMIN_EMAIL_2 = os.environ.get("ADMIN_EMAIL_2", "admin2@recomiendopymes.cl")
ADMIN_PASSWORD_2 = os.environ.get("ADMIN_PASSWORD_2", "changeme456")

CATEGORIAS = [
    {"name": "Artesanía", "slug": "artesania", "icon": "🎨"},
    {"name": "Gastronomía", "slug": "gastronomia", "icon": "🍽️"},
    {"name": "Moda y Vestuario", "slug": "moda-vestuario", "icon": "👗"},
    {"name": "Tecnología", "slug": "tecnologia", "icon": "💻"},
    {"name": "Belleza y Cuidado", "slug": "belleza-cuidado", "icon": "💄"},
    {"name": "Servicios", "slug": "servicios", "icon": "🛠️"},
    {"name": "Decoración del Hogar", "slug": "decoracion-hogar", "icon": "🏠"},
    {"name": "Salud y Bienestar", "slug": "salud-bienestar", "icon": "🌿"},
]

NEGOCIOS = [
    {
        "name": "Arcilla Viva", "slug": "arcilla-viva",
        "category": "Artesanía",
        "description": "Cerámica hecha a mano con técnicas ancestrales mapuche. Cada pieza es única y refleja la tradición cultural del sur de Chile.",
        "image": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600",
        "gallery": [],
        "social_links": {"instagram": "https://instagram.com/arcillaviva", "whatsapp": "56912345678"},
        "owner": "Javiera Ñancucheo",
        "business_type": "both",
        "delivery_type": "nationwide",
        "established": "2019",
        "city": "Temuco",
        "location": "Barrio Centro",
        "coordinates": {"lat": -38.7359, "lng": -72.5904, "is_exact": False},
        "status": "active",
        "rating": 4.8, "review_count": 12, "view_count": 0,
        "activated_at": datetime.utcnow() - timedelta(days=180),
        "featured": False, "is_verified": False, "plan": "free",
        "created_at": datetime.utcnow() - timedelta(days=200),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Empanadas de la Oma", "slug": "empanadas-de-la-oma",
        "category": "Gastronomía",
        "description": "Empanadas caseras con recetas de familia de más de 40 años. Pedidos para eventos, cumpleaños y celebraciones. Horno a leña.",
        "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600",
        "gallery": [],
        "social_links": {"facebook": "https://facebook.com/empanadasoma", "whatsapp": "56987654321"},
        "owner": "Rosa Fuentes",
        "business_type": "physical",
        "delivery_type": "local",
        "established": "2015",
        "city": "Concepción",
        "coordinates": {"lat": -36.8201, "lng": -73.0444, "is_exact": False},
        "status": "active",
        "rating": 4.6, "review_count": 8, "view_count": 0,
        "activated_at": datetime.utcnow() - timedelta(days=300),
        "featured": False, "is_verified": False, "plan": "free",
        "created_at": datetime.utcnow() - timedelta(days=320),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Código Sur", "slug": "codigo-sur",
        "category": "Tecnología",
        "description": "Desarrollo de sitios web y aplicaciones móviles para pequeñas empresas. Presupuesto sin costo. Trabajo 100% remoto.",
        "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
        "gallery": [],
        "social_links": {"instagram": "https://instagram.com/codigosur", "website": "https://codigosur.cl", "linkedin": "https://linkedin.com/in/codigosur"},
        "owner": "Felipe Herrera",
        "business_type": "online",
        "delivery_type": "nationwide",
        "established": "2021",
        "city": "Valparaíso",
        "coordinates": {"lat": -33.0472, "lng": -71.6127, "is_exact": False},
        "status": "active",
        "rating": 4.9, "review_count": 23, "view_count": 0,
        "activated_at": datetime.utcnow() - timedelta(days=10),  # Nuevo — aparecerá con badge
        "featured": False, "is_verified": False, "plan": "free",
        "created_at": datetime.utcnow() - timedelta(days=12),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Tejidos del Norte", "slug": "tejidos-del-norte",
        "category": "Artesanía",
        "description": "Tejidos a mano en lana de alpaca, inspirados en la cultura atacameña. Ponchos, chalinas y bolsos con diseños únicos del desierto chileno.",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        "gallery": [],
        "social_links": {"instagram": "https://instagram.com/tejidosnorte", "tiktok": "https://tiktok.com/@tejidosnorte"},
        "owner": "Carla Mamani",
        "business_type": "both",
        "delivery_type": "nationwide",
        "established": "2018",
        "city": "Antofagasta",
        "coordinates": {"lat": -23.6509, "lng": -70.3975, "is_exact": False},
        "status": "active",
        "rating": 4.7, "review_count": 15, "view_count": 0,
        "activated_at": datetime.utcnow() - timedelta(days=365),
        "featured": False, "is_verified": False, "plan": "free",
        "created_at": datetime.utcnow() - timedelta(days=380),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Naturalia Cosmética", "slug": "naturalia-cosmetica",
        "category": "Belleza y Cuidado",
        "description": "Cremas, jabones y aceites 100% naturales elaborados con plantas medicinales chilenas. Libres de parabenos y microplásticos.",
        "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600",
        "gallery": [],
        "social_links": {"instagram": "https://instagram.com/naturalia.cl", "facebook": "https://facebook.com/naturaliacl"},
        "owner": "Daniela Vásquez",
        "business_type": "online",
        "delivery_type": "nationwide",
        "established": "2020",
        "city": "Santiago",
        "coordinates": {"lat": -33.4489, "lng": -70.6693, "is_exact": False},
        "status": "pending",  # Pendiente de aprobación
        "rating": 0.0, "review_count": 0, "view_count": 0,
        "activated_at": None,
        "featured": False, "is_verified": False, "plan": "free",
        "created_at": datetime.utcnow() - timedelta(days=1),
        "updated_at": datetime.utcnow(),
    },
]

RESENIAS = [
    {"business_slug": "arcilla-viva", "rating": 5, "text": "Las piezas son una obra de arte. Compré una fuente y quedé encantada. El envío llegó perfectamente embalado.", "reviewer_name": "Claudia M.", "flagged": False},
    {"business_slug": "arcilla-viva", "rating": 5, "text": "Tremendo trabajo artesanal. Se nota el amor por lo que hacen. Muy recomendable.", "reviewer_name": "Pedro A.", "flagged": False},
    {"business_slug": "empanadas-de-la-oma", "rating": 4, "text": "Riquísimas las empanadas, el sabor casero se nota inmediatamente. Solo le faltó un poco más de relleno.", "reviewer_name": "Mario S.", "flagged": False},
    {"business_slug": "codigo-sur", "rating": 5, "text": "Excelente trabajo. Entregaron el sitio antes del plazo y con todo lo que pedí. Muy profesionales.", "reviewer_name": "Constanza R.", "flagged": False},
    {"business_slug": "tejidos-del-norte", "rating": 5, "text": "El poncho es hermoso y de muy buena calidad. Llegó con un mensaje personalizado. 100% recomendado.", "reviewer_name": "Ana L.", "flagged": False},
]

CONFIG_INICIAL = [
    {"key": "suspicious_review_count", "value": 5, "description": "Número de reseñas con el mismo rating en la ventana de tiempo para marcar como sospechoso"},
    {"key": "suspicious_review_window_hours", "value": 2, "description": "Ventana de tiempo en horas para la detección de reseñas sospechosas"},
    {"key": "new_business_boost_days", "value": 30, "description": "Días de impulso de visibilidad para nuevos emprendimientos sin reseñas"},
]

PAGINAS_LEGALES = [
    {
        "key": "terms",
        "content": """# Términos y Condiciones

## 1. Aceptación de los términos
Al registrar tu emprendimiento en RecomiendoPymes, aceptas estos términos y condiciones en su totalidad.

## 2. Responsabilidad del emprendedor
El emprendedor es responsable de la veracidad de toda la información publicada en su perfil, incluyendo descripción, imágenes, precios y datos de contacto.

## 3. Desactivación del listado
RecomiendoPymes se reserva el derecho de desactivar cualquier listado que infrinja estos términos, contenga información falsa, o sea reportado como fraudulento por la comunidad.

## 4. Reseñas
Los usuarios pueden dejar reseñas sobre emprendimientos. RecomiendoPymes modera estas reseñas para mantener la calidad del catálogo.

## 5. Modificaciones
RecomiendoPymes puede modificar estos términos en cualquier momento. El uso continuado de la plataforma implica la aceptación de los términos modificados.
""",
        "updated_at": datetime.utcnow()
    },
    {
        "key": "privacy",
        "content": """# Política de Privacidad

## Información que recopilamos
- Nombre y dirección de email al registrarte
- Información de tu emprendimiento (nombre, descripción, ubicación)
- Reseñas que publicas

## Cómo usamos tu información
- Para mostrar tu emprendimiento en el catálogo
- Para enviarte notificaciones relacionadas con tu cuenta y emprendimiento
- Para mejorar el servicio

## Derechos según Ley 21.719 (Chile)
Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, contáctanos a privacidad@recomiendopymes.cl.

## Retención de datos
Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.

## Contacto
privacidad@recomiendopymes.cl
""",
        "updated_at": datetime.utcnow()
    }
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("🌱 Iniciando seed de datos...")

    # Limpiar colecciones
    for col in ["users", "businesses", "reviews", "categories", "config", "legal_pages"]:
        await db[col].drop()
    print("✅ Colecciones limpiadas")

    # Crear admins
    await db.users.insert_many([
        {
            "email": ADMIN_EMAIL,
            "name": "Administrador",
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "is_active": True,
            "is_email_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": ADMIN_EMAIL_2,
            "name": "Administrador 2",
            "password_hash": hash_password(ADMIN_PASSWORD_2),
            "role": "admin",
            "is_active": True,
            "is_email_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ])
    print(f"✅ Admins creados: {ADMIN_EMAIL}, {ADMIN_EMAIL_2}")

    # Crear usuario de prueba
    test_user = await db.users.insert_one({
        "email": "usuario@ejemplo.cl",
        "name": "Usuario de Prueba",
        "password_hash": hash_password("password123"),
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    print("✅ Usuario de prueba creado: usuario@ejemplo.cl / password123")

    # Crear categorías
    await db.categories.insert_many(CATEGORIAS)
    print(f"✅ {len(CATEGORIAS)} categorías creadas")

    # Crear negocios
    await db.businesses.insert_many(NEGOCIOS)
    print(f"✅ {len(NEGOCIOS)} negocios creados")

    # Crear reseñas
    businesses_by_slug = {}
    async for doc in db.businesses.find({}):
        businesses_by_slug[doc["slug"]] = doc

    review_docs = []
    for r in RESENIAS:
        biz = businesses_by_slug.get(r["business_slug"])
        if biz:
            review_docs.append({
                "business_id": biz["_id"],
                "reviewer_user_id": test_user.inserted_id,
                "reviewer_name": r["reviewer_name"],
                "rating": r["rating"],
                "text": r["text"],
                "is_visible": True,
                "flagged": r["flagged"],
                "response": None,
                "date": datetime.utcnow() - timedelta(days=len(review_docs) * 7),
                "created_at": datetime.utcnow(),
            })
    if review_docs:
        await db.reviews.insert_many(review_docs)
    print(f"✅ {len(review_docs)} reseñas creadas")

    # Crear configuración inicial
    await db.config.insert_many(CONFIG_INICIAL)
    print(f"✅ {len(CONFIG_INICIAL)} configuraciones iniciales creadas")

    # Crear páginas legales
    await db.legal_pages.insert_many(PAGINAS_LEGALES)
    print("✅ Páginas legales creadas (términos y privacidad)")

    # Crear índices
    await db.users.create_index("email", unique=True)
    await db.businesses.create_index("slug", unique=True)
    await db.businesses.create_index("status")
    await db.reviews.create_index("business_id")
    await db.config.create_index("key", unique=True)
    print("✅ Índices creados")

    client.close()
    print("\n🎉 Seed completado exitosamente")
    print(f"\nAdmin 1: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"Admin 2: {ADMIN_EMAIL_2} / {ADMIN_PASSWORD_2}")
    print(f"Usuario prueba: usuario@ejemplo.cl / password123")

if __name__ == "__main__":
    asyncio.run(seed())
```

- [ ] **Step 2: Ejecutar seed**

```bash
cd backend && python seed_data.py
```

Expected:
```
🌱 Iniciando seed de datos...
✅ Colecciones limpiadas
✅ Admins creados: ...
✅ 8 categorías creadas
✅ 5 negocios creados
✅ 5 reseñas creadas
✅ Configuraciones creadas
✅ Índices creados
🎉 Seed completado exitosamente
```

---

## Task 16: Verificación final del backend

- [ ] **Step 1: Ejecutar todos los tests**

```bash
cd backend && python -m pytest ../tests/ -v
```

Expected: todos los tests pasan.

- [ ] **Step 2: Levantar el servidor y verificar endpoints**

```bash
cd backend && uvicorn server:app --reload --port 8000
```

Verificar con curl o browser:

```bash
# Health
curl http://localhost:8000/api/health
# Expected: {"status":"ok","version":"2.0.0"}

# Registro
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.cl","password":"password123","name":"Test User"}'
# Expected: {"access_token":"...","user":{...}}

# Login admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recomiendopymes.cl","password":"[TU_ADMIN_PASSWORD]"}'
# Expected: {"access_token":"...","user":{"role":"admin",...}}

# Negocios
curl http://localhost:8000/api/businesses
# Expected: {"businesses":[...],"total":4,"page":1,"total_pages":1}
# (Solo activos — el negocio "Naturalia" está pending y NO aparece)

# Dashboard admin (usar token del login admin)
curl http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer [TOKEN]"
# Expected: {"businesses":{"total":5,"pending":1,"active":4,...},...}

# Sitemap
curl http://localhost:8000/sitemap.xml
# Expected: XML con URLs de negocios activos
```

- [ ] **Step 3: Commit (si auto_commit está habilitado)**

Revisar `.agent/config.yml`. Si `auto_commit: false`, saltar este paso.

```bash
git add backend/
git commit -m "feat: backend modular refactor + auth + modelos actualizados + seed data chileno"
```

---

## Checklist de spec coverage

| Req del spec | Cubierto en |
|---|---|
| Módulos independientes (core, auth, business, review, media, admin, meta) | Task 1-13 |
| JWT stateless (access + refresh cookie) | Task 2, 6 |
| Registro usuario + email verificación (Resend) | Task 5 |
| Reset de contraseña via email | Task 5 |
| Modelo User (2 roles: admin/user) | Task 4 |
| Modelo Business con slug, status, activated_at, coordinates, monetización | Task 7 |
| Ciclo de vida pending→active→inactive | Task 8 |
| Slug único con fallback numérico (R1) | Task 8 |
| Caché coordenadas ciudades Chile (R3) | Task 8 |
| Ordenamiento: destacados→nuevos→ranked→unranked | Task 8 |
| Modelo Review con flagged, response, reviewer_user_id | Task 10 |
| Detección automática de sospechosos (configurable) | Task 10 |
| Casada inactivación usuario (R8) | Task 13 |
| Upload Cloudinary (firma segura) | Task 11 |
| Admin dashboard métricas | Task 13 |
| Admin gestión reviews (ocultar) | Task 13 |
| Admin gestión usuarios (toggle + promover) | Task 13 |
| Admin páginas legales editables | Task 13 |
| Admin configuración del sistema | Task 13 |
| Sitemap.xml | Task 12 |
| Seed data en español con admins + config inicial | Task 15 |
| 2 admins en seed (R4) | Task 15 |
| Páginas legales en español (T&C + Privacidad Ley 21.719) | Task 15 |
| Módulo payments placeholder | Task 1 |
