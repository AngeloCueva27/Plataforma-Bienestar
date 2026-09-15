from datetime import date


def test_obtener_promedios_semanales_vacio(client_autenticado):
    response = client_autenticado.get("/estadisticas/semanal")
    assert response.status_code == 200
    data = response.json()
    assert data["total_registros"] == 0
    assert data["promedio_horas_sueno"] == 0.0


def test_obtener_promedios_semanales_con_datos(client_autenticado):
    registro = {
        "fecha": date.today().isoformat(),
        "horas_sueno": 8.0,
        "nivel_estres": 4,
        "nivel_animo": 7,
        "horas_estudio": 5.0,
        "actividad_fisica_minutos": 30,
        "nivel_concentracion": 8,
        "rendimiento_percibido": 8,
    }
    response_post = client_autenticado.post("/bienestar/registrar", json=registro)
    assert response_post.status_code in (200, 201)

    response = client_autenticado.get("/estadisticas/semanal")
    assert response.status_code == 200
    data = response.json()
    assert data["total_registros"] == 1
    assert data["promedio_horas_sueno"] == 8.0

def test_obtener_historico_con_datos(client_autenticado):
    registro = {
        "fecha": date.today().isoformat(),
        "horas_sueno": 7.5,
        "nivel_estres": 3,
        "nivel_animo": 8,
        "horas_estudio": 4.0,
        "actividad_fisica_minutos": 45,
        "nivel_concentracion": 9,
        "rendimiento_percibido": 8,
    }
    client_autenticado.post("/bienestar/registrar", json=registro)

    response = client_autenticado.get("/estadisticas/historico?dias=7")
    assert response.status_code == 200
    data = response.json()
    assert "dias" in data
    assert len(data["dias"]) >= 1
    assert data["dias"][0]["horas_sueno"] == 7.5