from datetime import date, timedelta


def test_exportar_csv_vacio(client_autenticado):
    response = client_autenticado.get("/exportar/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "historial_bienestar.csv" in response.headers["content-disposition"]

    lineas = response.text.strip().splitlines()
    assert len(lineas) == 1


def test_exportar_csv_con_filtro_fechas(client_autenticado):
    hoy = date.today()
    ayer = hoy - timedelta(days=1)

    reg_ayer = {
        "fecha": ayer.isoformat(),
        "horas_sueno": 7.0,
        "nivel_estres": 4,
        "nivel_animo": 7,
        "horas_estudio": 4.0,
        "actividad_fisica": True,
        "actividad_fisica_minutos": 20,
        "nivel_concentracion": 7,
        "rendimiento_percibido": 7,
    }
    reg_hoy = {
        "fecha": hoy.isoformat(),
        "horas_sueno": 8.0,
        "nivel_estres": 3,
        "nivel_animo": 8,
        "horas_estudio": 6.0,
        "actividad_fisica_minutos": 45,
        "nivel_concentracion": 8,
        "rendimiento_percibido": 9,
    }

    client_autenticado.post("/bienestar/registrar", json=reg_ayer)
    client_autenticado.post("/bienestar/registrar", json=reg_hoy)

    # Filtrar solo la fecha de hoy
    response = client_autenticado.get(f"/exportar/csv?fecha_inicio={hoy.isoformat()}")
    assert response.status_code == 200

    lineas = response.text.strip().splitlines()
    assert len(lineas) == 2
    assert hoy.isoformat() in lineas[1]