"""Tests de reglas de reseñas: bloquear auto-reseña (RV-1)."""
import pytest
from bson import ObjectId
from fastapi import HTTPException

from modules.review.service import ReviewService
from modules.review.models import ReviewCreate
from tests.conftest import FakeCollection, FakeDB

OWNER_ID = ObjectId()


async def test_cannot_review_own_business():
    biz_id = ObjectId()
    businesses = FakeCollection([{"_id": biz_id, "status": "active", "owner_user_id": OWNER_ID}])
    svc = ReviewService(FakeDB(businesses=businesses, reviews=FakeCollection([]), users=FakeCollection([])))
    author = {"_id": OWNER_ID, "name": "Dueño"}
    with pytest.raises(HTTPException) as exc:
        await svc.create(str(biz_id), ReviewCreate(rating=5, comment="Muy bueno!"), author)
    assert exc.value.status_code == 400
