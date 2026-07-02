"""B-4: el modelo de registro no debe exponer campos controlados por el servidor."""
from modules.auth.models import UserCreate


def test_usercreate_does_not_expose_privileged_fields():
    """role / is_active / is_email_verified NO son campos de entrada de registro."""
    fields = set(UserCreate.model_fields.keys())
    assert "role" not in fields
    assert "is_active" not in fields
    assert "is_email_verified" not in fields
    assert {"email", "name", "password", "accepted_terms"} <= fields


def test_usercreate_ignores_injected_role():
    """Aunque un cliente mande role='admin', el modelo no lo conserva (no escala privilegios)."""
    user = UserCreate(
        email="test@example.com",
        name="Test",
        password="unaClaveSegura1",
        accepted_terms=True,
        role="admin",
        is_email_verified=True,
    )
    assert not hasattr(user, "role")
    assert not hasattr(user, "is_email_verified")
