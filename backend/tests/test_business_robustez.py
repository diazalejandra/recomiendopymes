"""Robustez de negocios: reintento de slug (N-10), id inválido→404 (N-11),
validación de URL de imagen Cloudinary (ME-4)."""
import pytest
from bson import ObjectId
from fastapi import HTTPException
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from core.config import settings
from modules.business.service import BusinessService
from modules.business.models import BusinessCreate
from tests.conftest import FakeCollection, FakeDB

OWNER_ID = ObjectId()
# Construir la URL con el cloud realmente configurado (o "demo" si no hay), para que
# el test sea independiente del .env local.
_CLOUD = settings.CLOUDINARY_CLOUD_NAME or "demo"
CLOUDINARY_URL = f"https://res.cloudinary.com/{_CLOUD}/image/upload/v1/recomiendopymes/foo.jpg"


def _valid_create(**overrides) -> BusinessCreate:
    base = dict(
        name="Pyme Test",
        category="Alimentos",
        description="Descripción suficientemente larga.",
        owner="Persona Dueña",
        business_type="online",
        region="Metropolitana",
        city="Santiago",
    )
    base.update(overrides)
    return BusinessCreate(**base)


class _FlakyInsertCollection(FakeCollection):
    """insert_one choca con el índice único las primeras `fail_times` veces, luego funciona."""
    def __init__(self, docs=None, fail_times=0):
        super().__init__(docs)
        self._fail_times = fail_times
        self.attempts = 0

    async def insert_one(self, doc):
        self.attempts += 1
        if self.attempts <= self._fail_times:
            raise DuplicateKeyError("duplicate slug")
        return await super().insert_one(doc)


# ---- N-11: id inválido → 404 ----

async def test_get_by_id_invalid_returns_404():
    svc = BusinessService(FakeDB(businesses=FakeCollection([]), reviews=FakeCollection([])))
    with pytest.raises(HTTPException) as exc:
        await svc.get_by_id("no-es-objectid")
    assert exc.value.status_code == 404


async def test_delete_invalid_id_returns_404():
    svc = BusinessService(FakeDB(businesses=FakeCollection([]), reviews=FakeCollection([])))
    with pytest.raises(HTTPException) as exc:
        await svc.delete("xxx")
    assert exc.value.status_code == 404


# ---- N-10: reintento de slug ante carrera ----

async def test_create_retries_slug_on_duplicate():
    businesses = _FlakyInsertCollection([], fail_times=2)
    svc = BusinessService(FakeDB(businesses=businesses, reviews=FakeCollection([])))
    result = await svc.create(_valid_create(), str(OWNER_ID))
    assert result["name"] == "Pyme Test"
    assert businesses.attempts == 3  # 2 choques + 1 éxito


async def test_create_gives_up_after_max_retries():
    businesses = _FlakyInsertCollection([], fail_times=99)
    svc = BusinessService(FakeDB(businesses=businesses, reviews=FakeCollection([])))
    with pytest.raises(HTTPException) as exc:
        await svc.create(_valid_create(), str(OWNER_ID))
    assert exc.value.status_code == 409


# ---- ME-4: validación de URL de imagen ----

def test_rejects_non_cloudinary_image():
    with pytest.raises(ValidationError):
        _valid_create(image="https://images.unsplash.com/photo-123")


def test_rejects_javascript_pseudo_url():
    with pytest.raises(ValidationError):
        _valid_create(image="javascript:alert(1)")


def test_accepts_cloudinary_image():
    biz = _valid_create(image=CLOUDINARY_URL)
    assert biz.image == CLOUDINARY_URL


def test_accepts_none_image():
    biz = _valid_create(image=None)
    assert biz.image is None


def test_rejects_non_cloudinary_gallery_item():
    with pytest.raises(ValidationError):
        _valid_create(gallery=[CLOUDINARY_URL, "https://evil.example/x.png"])
