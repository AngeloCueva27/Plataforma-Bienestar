from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class RecomendacionIA(Base):
    __tablename__ = "recomendaciones_ia"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    categoria = Column(String(50), nullable=False) # ej: integral, bienestar_fisico
    prioridad = Column(String(20), nullable=False) # baja, media, alta
    titulo = Column(String(150), nullable=False)
    contenido = Column(Text, nullable=False)
    disciplinas = Column(JSONB, nullable=False) # ej: ["Psicología", "Nutrición"]
    disclaimer = Column(Text, nullable=False)
    estado = Column(String(20), default="activa")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

class FeedbackRecomendacion(Base):
    __tablename__ = "feedback_recomendaciones"
    id = Column(Integer, primary_key=True, index=True)
    recomendacion_id = Column(Integer, ForeignKey("recomendaciones_ia.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo_feedback = Column(String(50), nullable=False) # util, no_util, reporte
    comentario = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

class ConversacionChat(Base):
    __tablename__ = "conversaciones_chat"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo = Column(String(150), nullable=True)
    estado = Column(String(20), default="activa")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

class MensajeChat(Base):
    __tablename__ = "mensajes_chat"
    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones_chat.id"), nullable=False)
    emisor = Column(String(20), nullable=False) # usuario, asistente, sistema
    contenido = Column(Text, nullable=False)
    disciplinas = Column(JSONB, nullable=True)
    requiere_apoyo_profesional = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

class AlertaBienestar(Base):
    __tablename__ = "alertas_bienestar"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    nivel = Column(String(20), nullable=False) # bajo, medio, alto
    regla_activada = Column(String(100), nullable=False)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    recomendacion = Column(Text, nullable=False)
    disciplinas = Column(JSONB, nullable=False)
    requiere_apoyo_profesional = Column(Boolean, default=False)
    leida = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

class AuditoriaIA(Base):
    __tablename__ = "auditoria_ia"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    modulo = Column(String(50), nullable=False) # chatbot, recomendaciones, alertas
    accion = Column(String(100), nullable=False)
    estado = Column(String(20), nullable=False) # exitoso, error
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
class ValidacionEspecialista(Base):
    __tablename__ = "validaciones_especialista"
    id = Column(Integer, primary_key=True, index=True)
    especialista_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recomendacion_id = Column(Integer, ForeignKey("recomendaciones_ia.id"), nullable=True)
    alerta_id = Column(Integer, ForeignKey("alertas_bienestar.id"), nullable=True)
    estado = Column(String(50), nullable=False) # aprobada, correccion_solicitada
    observacion = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())