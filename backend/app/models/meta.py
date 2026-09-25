# app/models/meta.py
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base

class MetaBienestar(Base):
    __tablename__ = "metas_bienestar"

    id = Column(Integer, primary_key=True, index=True)
    # unique=True hace que un usuario solo pueda tener un registro de metas
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Objetivos esperados
    meta_horas_sueno = Column(Float, nullable=False, default=8.0)
    meta_nivel_estres_max = Column(Integer, nullable=False, default=4)
    meta_nivel_animo_min = Column(Integer, nullable=False, default=7)
    meta_horas_estudio = Column(Float, nullable=False, default=4.0)
    meta_minutos_ejercicio = Column(Integer, nullable=False, default=30)

    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relación con el usuario
    # Apunta a la clase "User" y la variable "metas" dentro de esa clase
    usuario = relationship("User", back_populates="metas")