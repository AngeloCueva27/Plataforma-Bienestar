# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models import Base
from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash, create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Crea la estructura de tablas y entrega una sesión limpia por test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Cliente HTTP de prueba con la base de datos sobrescrita."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def usuario_prueba(db_session):
    """Usuario base persistido en la BD de pruebas."""
    usuario = User(
        nombre="Estudiante Test",
        email="test@ejemplo.com",
        hashed_password=get_password_hash("Password123"),
        ciclo=5,
        rol=RoleEnum.estudiante,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture(scope="function")
def client_autenticado(client, usuario_prueba):
    """Cliente HTTP con token Bearer adjunto en los headers."""
    token = create_access_token(data={"sub": usuario_prueba.email})
    client.headers = {**client.headers, "Authorization": f"Bearer {token}"}
    return client