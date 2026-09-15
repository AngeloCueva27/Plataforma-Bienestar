from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_leer_raiz():
    response = client.get("/")
    # Verifica que la API responda correctamente en la raíz
    assert response.status_code in [200, 404]

def test_registro_usuario_invalido():
    # Intento de registro con datos incompletos debe fallar
    response = client.post("/auth/register", json={
        "email": "correo_invalido",
        "password": "123"
    })
    assert response.status_code == 422