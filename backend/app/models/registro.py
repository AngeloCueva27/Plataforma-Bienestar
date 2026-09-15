from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class RegistroBienestar(Base):
    __tablename__ = "registros_bienestar"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    horas_sueno = Column(Float, nullable=False)
    nivel_estres = Column(Integer, nullable=False)
    nivel_animo = Column(Integer, nullable=False)
    horas_estudio = Column(Float, nullable=False)
    
    # Booleano correctamente definido
    actividad_fisica = Column(Boolean, default=False)
    
    # Columna agregada para evitar el error "invalid keyword argument"
    tipo_actividad = Column(String, nullable=True)
    
    alimentacion_resumen = Column(String, nullable=True)
    emociones = Column(String, nullable=True)
    nivel_concentracion = Column(Integer, nullable=True)
    rendimiento_percibido = Column(Integer, nullable=True)
    
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    # Relación de vuelta hacia el modelo User
    usuario = relationship("User", back_populates="registros")