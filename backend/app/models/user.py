import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base

class RoleEnum(str, enum.Enum):
    estudiante = "estudiante"
    docente = "docente"
    admin = "admin"
    user = "user"
    psicologo = "psicologo"
    nutricionista = "nutricionista"
    educador = "educador"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    # 1. ÚNICAMENTE las columnas que sí existen en tu base de datos PostgreSQL
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    ciclo = Column(Integer, nullable=True)
    rol = Column(Enum(RoleEnum), default=RoleEnum.estudiante)

    # 2. Relaciones con otras tablas
    registros = relationship("RegistroBienestar", back_populates="usuario")
    metas = relationship("MetaBienestar", back_populates="usuario")

    # 3. Propiedades dinámicas (FastAPI las leerá como si fueran columnas reales)
    @property
    def es_admin(self):
        return self.rol == RoleEnum.admin

    @property
    def is_active(self):
        return True
        
    @property
    def fecha_creacion(self):
        # Devuelve la fecha actual para satisfacer al esquema UserOut sin buscar en BD
        return datetime.now()