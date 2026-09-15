import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base

# Enum con todos los roles requeridos por el sistema
class RoleEnum(str, enum.Enum):
    estudiante = "estudiante"
    docente = "docente"
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    role = Column(Enum(RoleEnum), default=RoleEnum.estudiante, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relación bidireccional con RegistroBienestar
    registros = relationship("RegistroBienestar", back_populates="usuario")