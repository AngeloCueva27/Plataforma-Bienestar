from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class PromediosSemanales(BaseModel):
    promedio_horas_sueno: float
    promedio_nivel_estres: float
    promedio_nivel_animo: float
    promedio_horas_estudio: float
    promedio_ejercicio_minutos: float
    total_registros: int


class PuntoTendencia(BaseModel):
    fecha: date
    horas_sueno: float
    nivel_estres: int
    nivel_animo: Optional[int] = None
    horas_estudio: Optional[float] = None


class HistoricoRespuesta(BaseModel):
    dias: List[PuntoTendencia]
