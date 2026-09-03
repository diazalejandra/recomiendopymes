"""
Tests del gate de publicación: un negocio no puede pasar a `active` si su dueño no
verificó su email. El gate vive en la publicación (no en la creación): ver
business/service.py `change_status` y admin/service.py `approve_business` (ME-9).
"""
import pytest
from bson import ObjectId
from fastapi import HTTPException

from modules.business.service import BusinessService
from modules.admin.service import AdminService
from tests.conftest import FakeCollection, FakeDB

OWNER = ObjectId()


def _pending_business():
    return {
        "_id": ObjectId(),
        "slug": "negocio-x",
        "name": "Negocio X",
        "owner_user_id": OWNER,
        "status": "pending",
        "view_count": 0,
    }


def _db(business, owner_verified):
    return FakeDB(
        businesses=FakeCollection([business]),
        users=FakeCollection([{"_id": OWNER, "is_email_verified": owner_verified}]),
    )


# ---- change_status (transición a active, p.ej. reactivación admin) ----

async def test_change_status_active_blocked_when_owner_unverified():
    biz = _pending_business()
    svc = BusinessService(_db(biz, owner_verified=False))
    with pytest.raises(HTTPException) as exc:
        await svc.change_status(str(biz["_id"]), "active", by_admin=True)
    assert exc.value.status_code == 409


async def test_change_status_active_allowed_when_owner_verified():
    biz = _pending_business()
    svc = BusinessService(_db(biz, owner_verified=True))
    result = await svc.change_status(str(biz["_id"]), "active", by_admin=True)
    assert result["status"] == "active"


# ---- approve_business (aprobación admin de un pending) ----

async def test_approve_blocked_when_owner_unverified():
    biz = _pending_business()
    svc = AdminService(_db(biz, owner_verified=False))
    with pytest.raises(HTTPException) as exc:
        await svc.approve_business(str(biz["_id"]))
    assert exc.value.status_code == 409


async def test_approve_allowed_when_owner_verified():
    biz = _pending_business()
    svc = AdminService(_db(biz, owner_verified=True))
    result = await svc.approve_business(str(biz["_id"]))
    assert result["status"] == "active"
