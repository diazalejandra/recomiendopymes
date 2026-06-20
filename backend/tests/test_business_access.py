"""
Tests del control de acceso a negocios no activos (añadido en 1.1.0).

Regla: un negocio en estado `pending`/`inactive` solo es visible por su dueño o
por un admin; para el resto (anónimo u otro usuario) responde 404. Los negocios
`active` son públicos. El contador de visitas solo se incrementa en negocios activos.
"""
import pytest
from bson import ObjectId
from fastapi import HTTPException

from modules.business.service import BusinessService
from tests.conftest import FakeCollection, FakeDB

OWNER_ID = ObjectId()
OTHER_ID = ObjectId()
ADMIN_ID = ObjectId()

ANON = None
OWNER = {"_id": OWNER_ID, "role": "user"}
OTHER = {"_id": OTHER_ID, "role": "user"}
ADMIN = {"_id": ADMIN_ID, "role": "admin"}


def _business(status, slug):
    return {
        "_id": ObjectId(),
        "slug": slug,
        "name": f"Negocio {status}",
        "owner_user_id": OWNER_ID,
        "status": status,
        "view_count": 0,
    }


def _service(*docs):
    return BusinessService(FakeDB(businesses=FakeCollection(list(docs))))


# ---- Negocio activo: público ----

async def test_active_visible_for_anonymous():
    svc = _service(_business("active", "activo"))
    result = await svc.get_by_slug("activo", ANON)
    assert result["slug"] == "activo"


async def test_active_increments_view_count():
    doc = _business("active", "activo")
    coll = FakeCollection([doc])
    svc = BusinessService(FakeDB(businesses=coll))
    await svc.get_by_slug("activo", ANON)
    assert coll.stored(doc["_id"])["view_count"] == 1


# ---- Negocio pending: solo dueño/admin ----

@pytest.mark.parametrize("user", [ANON, OTHER])
async def test_pending_hidden_for_non_owner(user):
    svc = _service(_business("pending", "pendiente"))
    with pytest.raises(HTTPException) as exc:
        await svc.get_by_slug("pendiente", user)
    assert exc.value.status_code == 404


@pytest.mark.parametrize("user", [OWNER, ADMIN])
async def test_pending_visible_for_owner_and_admin(user):
    svc = _service(_business("pending", "pendiente"))
    result = await svc.get_by_slug("pendiente", user)
    assert result["slug"] == "pendiente"


async def test_non_active_does_not_increment_view_count():
    doc = _business("pending", "pendiente")
    coll = FakeCollection([doc])
    svc = BusinessService(FakeDB(businesses=coll))
    await svc.get_by_slug("pendiente", OWNER)
    assert coll.stored(doc["_id"])["view_count"] == 0


# ---- Negocio inactive: solo dueño/admin ----

async def test_inactive_hidden_for_anonymous():
    svc = _service(_business("inactive", "inactivo"))
    with pytest.raises(HTTPException) as exc:
        await svc.get_by_slug("inactivo", ANON)
    assert exc.value.status_code == 404


async def test_inactive_visible_for_admin():
    svc = _service(_business("inactive", "inactivo"))
    result = await svc.get_by_slug("inactivo", ADMIN)
    assert result["slug"] == "inactivo"


# ---- get_by_id: misma regla ----

async def test_get_by_id_pending_hidden_for_anonymous():
    doc = _business("pending", "pendiente")
    svc = _service(doc)
    with pytest.raises(HTTPException) as exc:
        await svc.get_by_id(str(doc["_id"]), ANON)
    assert exc.value.status_code == 404


async def test_get_by_id_pending_visible_for_owner():
    doc = _business("pending", "pendiente")
    svc = _service(doc)
    result = await svc.get_by_id(str(doc["_id"]), OWNER)
    assert result["id"] == str(doc["_id"])


async def test_get_by_slug_missing_returns_404():
    svc = _service()
    with pytest.raises(HTTPException) as exc:
        await svc.get_by_slug("no-existe", ADMIN)
    assert exc.value.status_code == 404
