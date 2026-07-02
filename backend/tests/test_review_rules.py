"""Tests de reglas y robustez de reseñas: auto-reseña (RV-1), id inválido (N-11),
carrera de reseña duplicada (RV-6)."""
import pytest
from bson import ObjectId
from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from modules.review.service import ReviewService
from modules.review.models import ReviewCreate
from tests.conftest import FakeCollection, FakeDB

OWNER_ID = ObjectId()


class _DupInsertCollection(FakeCollection):
    """FakeCollection cuyo insert_one siempre choca con el índice único."""
    async def insert_one(self, doc):
        raise DuplicateKeyError("duplicate key")


async def test_cannot_review_own_business():
    biz_id = ObjectId()
    businesses = FakeCollection([{"_id": biz_id, "status": "active", "owner_user_id": OWNER_ID}])
    svc = ReviewService(FakeDB(businesses=businesses, reviews=FakeCollection([]), users=FakeCollection([])))
    author = {"_id": OWNER_ID, "name": "Dueño"}
    with pytest.raises(HTTPException) as exc:
        await svc.create(str(biz_id), ReviewCreate(rating=5, comment="Muy bueno!"), author)
    assert exc.value.status_code == 400


async def test_review_invalid_business_id_returns_404():
    """N-11: un business_id malformado responde 404, no 500."""
    svc = ReviewService(FakeDB(businesses=FakeCollection([]), reviews=FakeCollection([]), users=FakeCollection([])))
    author = {"_id": ObjectId(), "name": "Cliente"}
    with pytest.raises(HTTPException) as exc:
        await svc.create("no-es-un-objectid", ReviewCreate(rating=5, comment="Excelente!"), author)
    assert exc.value.status_code == 404


async def test_duplicate_review_race_returns_400():
    """RV-6: si el índice único choca en el insert (carrera), responde 400, no 500."""
    biz_id = ObjectId()
    businesses = FakeCollection([{"_id": biz_id, "status": "active", "owner_user_id": OWNER_ID}])
    # El find_one previo no encuentra reseña (empieza vacío), pero el insert choca.
    reviews = _DupInsertCollection([])
    svc = ReviewService(FakeDB(businesses=businesses, reviews=reviews, users=FakeCollection([]), config=FakeCollection([])))
    author = {"_id": ObjectId(), "name": "Cliente"}
    with pytest.raises(HTTPException) as exc:
        await svc.create(str(biz_id), ReviewCreate(rating=4, comment="Buen servicio"), author)
    assert exc.value.status_code == 400
