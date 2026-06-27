"""Tests de salvaguardas del admin: último admin (AD-2) y reject 404 (AD-6)."""
import pytest
from bson import ObjectId
from fastapi import HTTPException

from modules.admin.service import AdminService
from tests.conftest import FakeCollection, FakeDB


def _svc(users):
    return AdminService(FakeDB(users=users, businesses=FakeCollection([]), reviews=FakeCollection([])))


async def test_cannot_deactivate_last_admin():
    admin_id = ObjectId()
    svc = _svc(FakeCollection([{"_id": admin_id, "role": "admin", "is_active": True, "name": "A"}]))
    with pytest.raises(HTTPException) as exc:
        await svc.toggle_user_active(str(admin_id))
    assert exc.value.status_code == 400


async def test_can_deactivate_admin_when_others_exist():
    a1, a2 = ObjectId(), ObjectId()
    svc = _svc(FakeCollection([
        {"_id": a1, "role": "admin", "is_active": True, "name": "A1"},
        {"_id": a2, "role": "admin", "is_active": True, "name": "A2"},
    ]))
    res = await svc.toggle_user_active(str(a1))
    assert res["is_active"] is False


async def test_cannot_demote_last_admin():
    admin_id = ObjectId()
    svc = _svc(FakeCollection([{"_id": admin_id, "role": "admin", "is_active": True, "name": "A"}]))
    with pytest.raises(HTTPException) as exc:
        await svc.demote_user(str(admin_id))
    assert exc.value.status_code == 400


async def test_demote_admin_when_others_exist():
    a1, a2 = ObjectId(), ObjectId()
    svc = _svc(FakeCollection([
        {"_id": a1, "role": "admin", "is_active": True, "name": "A1"},
        {"_id": a2, "role": "admin", "is_active": True, "name": "A2"},
    ]))
    res = await svc.demote_user(str(a1))
    assert res["role"] == "user"


async def test_reject_business_404():
    svc = _svc(FakeCollection([]))
    with pytest.raises(HTTPException) as exc:
        await svc.reject_business(str(ObjectId()))
    assert exc.value.status_code == 404
