from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base # Ajusta según tu configuración de Base

class RecomendacionIA(Base):
    __tablename__ = "recomendaciones_ia"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    categoria = Column(String)
    prioridad = Column(String)
    titulo = Column(String)
    contenido = Column(String)
    disciplinas = Column(JSON)
    disclaimer = Column(String)
    estado = Column(String, default="activa") # activa, archivada, reportada
    calificacion_utilidad = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

class ConversacionChat(Base):
    __tablename__ = "conversaciones_chat"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    estado = Column(String, default="abierta")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    mensajes = relationship("MensajeChat", back_populates="conversacion")

class MensajeChat(Base):
    __tablename__ = "mensajes_chat"
    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones_chat.id"))
    emisor = Column(String) # usuario, asistente, sistema
    contenido = Column(String)
    disciplinas = Column(JSON, nullable=True)
    requiere_apoyo_profesional = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    conversacion = relationship("ConversacionChat", back_populates="mensajes")

class AlertaBienestar(Base):
    __tablename__ = "alertas_bienestar"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    tipo = Column(String)
    nivel = Column(String)
    titulo = Column(String)
    descripcion = Column(String)
    recomendacion = Column(String)
    disciplinas = Column(JSON)
    requiere_apoyo_profesional = Column(Boolean, default=False)
    leida = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

class AuditoriaIA(Base):
    __tablename__ = "auditoria_ia"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    modulo = Column(String) # recomendaciones, chatbot, alertas
    accion = Column(String)
    estado = Column(String) # exitoso, error, bloqueado
    tiempo_respuesta_ms = Column(Float, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)