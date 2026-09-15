import pytest


def test_obtener_metas_por_defecto(client_autenticado):
    """Verifica que se generen metas por defecto si el usuario aún no ha creado ninguna."""
    response = client_autenticado.get("/metas/")
    assert response.status_code == 200
    data = response.json()
    assert data["meta_horas_sueno"] == 8.0
    assert data["meta_nivel_estres_max"] == 4
    assert "id" in data


def test_actualizar_metas(client_autenticado):
    """Verifica la edición parcial de los objetivos de bienestar."""
    payload = {
        "meta_horas_sueno": 7.0,
        "meta_nivel_estres_max": 3,
    }
    response = client_autenticado.put("/metas/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["meta_horas_sueno"] == 7.0
    assert data["meta_nivel_estres_max"] == 3


def test_evaluar_cumplimiento_sin_registros(client_autenticado):
    """Verifica la respuesta del cálculo de cumplimiento cuando aún no existen registros diarios."""
    response = client_autenticado.get("/metas/cumplimiento")
    assert response.status_code == 200
    data = response.json()
    assert "porcentaje_cumplimiento_general" in data
    assert isinstance(data["porcentaje_cumplimiento_general"], float)


def test_evaluar_cumplimiento_con_registros(client_autenticado):
    """Verifica la evaluación exitosa comparando registros contra metas."""
    # Insertar un registro diario con métricas que cumplen las metas por defecto
    registro = {
        "fecha": "2026-09-12",
        "horas_sueno": 8.5,
        "actividad_fisica": True,
        "actividad_fisica_tipo": "Gimnasio",
        "actividad_fisica_minutos": 45,
        "alimentacion_resumen": "Buena",
        "nivel_estres": 2,
        "nivel_animo": 9,
        "emociones": "Motivado",
        "horas_estudio": 5.0,
        "nivel_concentracion": 8,
        "rendimiento_percibido": 9,
    }
    client_autenticado.post("/bienestar/registrar", json=registro)

    response = client_autenticado.get("/metas/cumplimiento")
    assert response.status_code == 200
    data = response.json()
    assert data["meta_horas_sueno_lograda"] is True
    assert data["meta_estres_controlado"] is True
    assert data["porcentaje_cumplimiento_general"] == 80.0


def test_metas_sin_autenticacion(client):
    """Verifica rechazo 401 para peticiones no autenticadas."""
    response = client.get("/metas/")
    assert response.status_code == 401