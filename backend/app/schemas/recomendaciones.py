from pydantic import BaseModel
from typing import List


class Recomendacion(BaseModel):
    categoria: str  # "sueno", "estres", "estudio", "actividad"
    nivel: str      # "info", "warning", "danger"
    titulo: str
    mensaje: str


class RecomendacionesResponse(BaseModel):
    total: int
    recomendaciones: List[Recomendacion]
