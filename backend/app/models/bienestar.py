from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class RegistroBienestar(Base):
    __tablename__ = "registros_bienestar"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ==========================================
    # A. BIENESTAR FÍSICO Y NUTRICIONAL
    # ==========================================
    horas_sueno = Column(Float, nullable=False)
    comidas_realizadas = Column(Integer, default=3)
    vasos_agua = Column(Integer, default=0)
    actividad_fisica = Column(String(50), nullable=False)
    minutos_actividad_fisica = Column(Integer, default=0)
    nivel_energia = Column(Integer, default=5) # Rango 1 al 10

    # ==========================================
    # B. BIENESTAR EMOCIONAL (Psicología)
    # ==========================================
    estado_animo = Column(String(50), nullable=False) # Se mantiene por compatibilidad
    nivel_animo = Column(Integer, default=5) # Rango 1 al 10
    nivel_estres = Column(Integer, nullable=False) # Rango 1 al 10
    emociones_predominantes = Column(String(200), nullable=True) # Ej: "ansiedad, calma"
    notas = Column(Text, nullable=True) # Comentario opcional (máx 300 chars)
    
    # ==========================================
    # C. BIENESTAR ACADÉMICO (Ciencias de la Educación)
    # ==========================================
    horas_estudio = Column(Float, default=0.0)
    nivel_concentracion = Column(Integer, default=5) # Rango 1 al 10
    rendimiento_percibido = Column(Integer, default=5) # Rango 1 al 10
    pausas_estudio = Column(Boolean, default=False)
    
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con el usuario
    usuario = relationship(
        "app.models.user.User", 
        back_populates="registros"
    )

# ASEGÚRATE DE BORRAR LA CLASE AlertaBienestar QUE ESTABA AQUÍ ABAJO