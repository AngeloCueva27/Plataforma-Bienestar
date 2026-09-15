from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class MetaBienestar(Base):
    __tablename__ = "metas_bienestar"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    usuario = relationship("User", back_populates="metas")

class MetaBienestarBase(BaseModel):
    meta_horas_sueno: float = Field(default=8.0, ge=0, le=24)
    meta_nivel_estres_max: int = Field(default=4, ge=1, le=10)
    meta_nivel_animo_min: int = Field(default=7, ge=1, le=10)
    meta_horas_estudio: float = Field(default=4.0, ge=0, le=24)
    meta_minutos_ejercicio: int = Field(default=30, ge=0)


class MetaBienestarCreate(MetaBienestarBase):
    pass


class MetaBienestarUpdate(BaseModel):
    meta_horas_sueno: Optional[float] = Field(None, ge=0, le=24)
    meta_nivel_estres_max: Optional[int] = Field(None, ge=1, le=10)
    meta_nivel_animo_min: Optional[int] = Field(None, ge=1, le=10)
    meta_horas_estudio: Optional[float] = Field(None, ge=0, le=24)
    meta_minutos_ejercicio: Optional[int] = Field(None, ge=0)


class MetaBienestarResponse(MetaBienestarBase):
    id: int
    usuario_id: int
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)


class CumplimientoMetasResponse(BaseModel):
    meta_horas_sueno_lograda: bool
    meta_estres_controlado: bool
    meta_animo_logrado: bool
    meta_estudio_lograda: bool
    meta_ejercicio_lograda: bool
    porcentaje_cumplimiento_general: float
