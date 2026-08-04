"""
Tests del badge "Nuevo" (`is_new`) calculado en el backend.

Regla: un negocio es "nuevo" si se activó dentro de la ventana `boost_days`
(configurable vía admin, fallback 30). Es la fuente única de verdad: el badge
visible y el boost de orden usan el mismo umbral. Ver business/service.py.
"""
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from modules.business.service import BusinessService
from tests.conftest import FakeCollection, FakeDB

ANON = None


def _active(slug, activated_at):
    return {
        "_id": ObjectId(),
        "slug": slug,
        "name": "Negocio",
        "owner_user_id": ObjectId(),
        "status": "active",
        "view_count": 0,
        "activated_at": activated_at,
    }


def _service(doc, boost_days=None):
    collections = {"businesses": FakeCollection([doc])}
    if boost_days is not None:
        collections["config"] = FakeCollection([{"key": "boost_days", "value": boost_days}])
    return BusinessService(FakeDB(**collections))


def _days_ago(n):
    return datetime.now(timezone.utc) - timedelta(days=n)


async def test_recently_activated_is_new():
    svc = _service(_active("nuevo", _days_ago(5)))
    result = await svc.get_by_slug("nuevo", ANON)
    assert result["is_new"] is True


async def test_old_activation_is_not_new():
    svc = _service(_active("viejo", _days_ago(40)))
    result = await svc.get_by_slug("viejo", ANON)
    assert result["is_new"] is False


async def test_never_activated_is_not_new():
    svc = _service(_active("sin-fecha", None))
    result = await svc.get_by_slug("sin-fecha", ANON)
    assert result["is_new"] is False


async def test_boost_days_config_shortens_window():
    # Activado hace 5 días, pero la ventana configurada es de 3 → ya no es nuevo
    svc = _service(_active("corto", _days_ago(5)), boost_days=3)
    result = await svc.get_by_slug("corto", ANON)
    assert result["is_new"] is False


async def test_boost_days_config_extends_window():
    # Activado hace 40 días, pero la ventana configurada es de 60 → sigue siendo nuevo
    svc = _service(_active("largo", _days_ago(40)), boost_days=60)
    result = await svc.get_by_slug("largo", ANON)
    assert result["is_new"] is True
