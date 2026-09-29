from pydantic import BaseModel
from typing import Optional

class ValidacionEspecialistaCreate(BaseModel):
    recomendacion_id: Optional[int] = None
    alerta_id: Optional[int] = None
    estado: str
    observacion: Optional[str] = None