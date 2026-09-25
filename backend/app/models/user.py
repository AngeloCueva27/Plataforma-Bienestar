import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base

class RoleEnum(str, enum.Enum):
    estudiante = "estudiante"
    docente = "docente"
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    ciclo = Column(String, nullable=True)
    rol = Column(String, default="estudiante", nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # RUTA COMPLETA EXACTA HACIA BIENESTAR
    registros = relationship(
        "app.models.bienestar.RegistroBienestar", 
        back_populates="usuario"
    )
    
    # RUTA COMPLETA EXACTA HACIA METAS
    metas = relationship(
        "app.models.meta.MetaBienestar", 
        back_populates="usuario", 
        uselist=False
    )