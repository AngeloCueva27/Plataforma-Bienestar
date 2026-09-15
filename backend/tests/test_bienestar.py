import pytest
from app.main import app
from app.core.security import get_current_user
from app.models.user import User

# Fixture para simular un usuario autenticado
@pytest.fixture
def client_autenticado(client):
    usuario_mock = User(id=1, email="test@example.com")
    app.dependency_overrides[get_current_user] = lambda: usuario_mock
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def test_registrar_bienestar_sin_token(client):
    """Verifica rechazo 401 al intentar registrar sin autenticación."""
    payload = {
        "fecha": "2026-09-12",
        "horas_sueno": 7.5,
        "nivel_estres": 4,
        "nivel_animo": 8,
        "horas_estudio": 5.0,
        "nivel_concentracion": 8,
        "rendimiento_percibido": 9
    }
    response = client.post("/bienestar/registrar", json=payload)
    assert response.status_code == 401


def test_validacion_datos_invalidos(client_autenticado):
    """Verifica rechazo 422 al enviar valores fuera de rango."""
    payload_invalido = {
        "fecha": "2026-09-12",
        "horas_sueno": 30.0,  # Inválido (> 24)
        "nivel_estres": 15,    # Inválido (> 10)
        "nivel_animo": 5,
        "horas_estudio": 4.0,
        "nivel_concentracion": 5,
        "rendimiento_percibido": 5
    }
    response = client_autenticado.post("/bienestar/registrar", json=payload_invalido)
    assert response.status_code == 422


def test_registrar_bienestar_exitoso(client_autenticado):
    """Verifica respuesta 201 al registrar con datos correctos."""
    payload_valido = {
        "fecha": "2026-09-12",
        "horas_sueno": 7.5,
        "actividad_fisica_tipo": "Correr",
        "actividad_fisica_minutos": 30,
        "alimentacion_resumen": "Saludable",
        "nivel_estres": 3,
        "nivel_animo": 8,
        "emociones": "Motivado",
        "horas_estudio": 6.0,
        "nivel_concentracion": 8,
        "rendimiento_percibido": 9
    }
    response = client_autenticado.post("/bienestar/registrar", json=payload_valido)
    assert response.status_code == 201
    assert response.json()["user_id"] == 1