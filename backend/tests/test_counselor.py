from app.models.user import User, RoleEnum


def test_acceso_denegado_estudiante(client_autenticado):
    response = client_autenticado.get("/counselor/resumen-global")
    assert response.status_code == 403


def test_acceso_permitido_docente(client_autenticado, db_session):
    usuario = db_session.query(User).first()
    usuario.rol = RoleEnum.docente
    db_session.commit()

    response = client_autenticado.get("/counselor/resumen-global")
    assert response.status_code == 200
    data = response.json()
    assert "total_estudiantes_registrados" in data