"""
Tests del registro: captura de consentimiento de T&C/Privacidad (B-6, Ley 21.719).
"""
import pytest
from fastapi import HTTPException

from modules.auth.models import UserCreate
from modules.auth.service import AuthService
import modules.auth.service as auth_service
from tests.conftest import FakeCollection, FakeDB


async def _noop(*args, **kwargs):
    return None


def _svc(monkeypatch):
    # Evita enviar email real durante el test
    monkeypatch.setattr(auth_service, "send_verification_email", _noop)
    users = FakeCollection([])
    return AuthService(FakeDB(users=users)), users


async def test_register_rejected_without_consent(monkeypatch):
    svc, users = _svc(monkeypatch)
    data = UserCreate(email="ana@correo.cl", name="Ana", password="clave1234", accepted_terms=False)
    with pytest.raises(HTTPException) as exc:
        await svc.register(data)
    assert exc.value.status_code == 400
    assert users._docs == []  # no se creó la cuenta


async def test_register_records_consent(monkeypatch):
    svc, users = _svc(monkeypatch)
    data = UserCreate(email="ana@correo.cl", name="Ana", password="clave1234", accepted_terms=True)
    result = await svc.register(data)

    assert result.user.email == "ana@correo.cl"
    stored = users._docs[0]
    assert stored["accepted_terms"] is True
    assert stored["terms_version"]            # se guardó la versión vigente
    assert stored["terms_accepted_at"] is not None
    assert stored["role"] == "user"           # nunca admin desde registro
