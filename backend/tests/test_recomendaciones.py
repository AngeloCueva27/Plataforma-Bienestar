from datetime import date


def test_recomendaciones_sin_registros(client_autenticado):
    response = client_autenticado.get("/recomendaciones/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["recomendaciones"][0]["categoria"] == "general"


def test_alerta_sueno_y_estres_alto(client_autenticado):
    registro = {
        "fecha": date.today().isoformat(),
        "horas_sueno": 4.5,
        "nivel_estres": 9,
        "nivel_animo": 3,
        "horas_estudio": 9.0,
        "actividad_fisica_minutos": 0,
        "nivel_concentracion": 4,
        "rendimiento_percibido": 5,
    }
    client_autenticado.post("/bienestar/registrar", json=registro)

    response = client_autenticado.get("/recomendaciones/")
    assert response.status_code == 200
    data = response.json()
    
    categorias = [r["categoria"] for r in data["recomendaciones"]]
    assert "sueno" in categorias
    assert "estres" in categorias