"""
Tests de la cascada al activar/inactivar un usuario (admin).

Inactivar un usuario debe: ocultar sus reseñas y pasar a `inactive` sus negocios
que estaban `active` (los `pending` no se tocan).

OJO — discrepancia conocida con el spec: el diseño (R8, punto 5) dice que al
REACTIVAR no se revierte la cascada automáticamente, pero el código actual SÍ
revierte (negocios inactive→pending, reseñas vuelven visibles). Estos tests fijan
el comportamiento REAL actual; si se decide alinear con el spec, hay que
actualizarlos junto con admin/service.py.
"""
from bson import ObjectId

from modules.admin.service import AdminService
from tests.conftest import FakeCollection, FakeDB

USER_ID = ObjectId()


def _setup(user_active: bool, biz_status: str, review_visible: bool):
    user = {"_id": USER_ID, "name": "Ana", "is_active": user_active}
    biz_active = {"_id": ObjectId(), "owner_user_id": USER_ID, "status": biz_status}
    biz_pending = {"_id": ObjectId(), "owner_user_id": USER_ID, "status": "pending"}
    review = {"_id": ObjectId(), "author_id": USER_ID, "is_visible": review_visible}
    users = FakeCollection([user])
    businesses = FakeCollection([biz_active, biz_pending])
    reviews = FakeCollection([review])
    svc = AdminService(FakeDB(users=users, businesses=businesses, reviews=reviews))
    return svc, businesses, reviews, biz_active["_id"], biz_pending["_id"], review["_id"]


async def test_deactivation_cascades():
    svc, businesses, reviews, active_id, pending_id, review_id = _setup(
        user_active=True, biz_status="active", review_visible=True
    )
    result = await svc.toggle_user_active(str(USER_ID))

    assert result["is_active"] is False
    # Negocio activo → inactive
    assert businesses.stored(active_id)["status"] == "inactive"
    # Negocio pending → intacto (la cascada solo toca los active)
    assert businesses.stored(pending_id)["status"] == "pending"
    # Reseñas ocultas
    assert reviews.stored(review_id)["is_visible"] is False


async def test_reactivation_reverts_cascade_current_behavior():
    svc, businesses, reviews, active_id, pending_id, review_id = _setup(
        user_active=False, biz_status="inactive", review_visible=False
    )
    result = await svc.toggle_user_active(str(USER_ID))

    assert result["is_active"] is True
    # Comportamiento ACTUAL (no el del spec): inactive → pending
    assert businesses.stored(active_id)["status"] == "pending"
    assert reviews.stored(review_id)["is_visible"] is True


async def test_toggle_missing_user_raises_404():
    import pytest
    from fastapi import HTTPException
    svc = AdminService(FakeDB(users=FakeCollection([]), businesses=FakeCollection([]), reviews=FakeCollection([])))
    with pytest.raises(HTTPException) as exc:
        await svc.toggle_user_active(str(ObjectId()))
    assert exc.value.status_code == 404
