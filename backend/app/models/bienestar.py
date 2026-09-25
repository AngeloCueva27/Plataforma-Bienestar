from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class RegistroBienestar(Base):
    __tablename__ = "registros_bienestar"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    estado_animo = Column(String(50), nullable=False)
    nivel_estres = Column(Integer, nullable=False)
    horas_sueno = Column(Float, nullable=False)
    horas_estudio = Column(Float, default=0.0)
    actividad_fisica = Column(String(50), nullable=False)
    notas = Column(Text, nullable=True)
    
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    # RUTA COMPLETA EXACTA DE REGRESO HACIA USER
    usuario = relationship(
        "app.models.user.User", 
        back_populates="registros"
    )