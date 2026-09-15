from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class RegistroBienestarCreate(BaseModel):
    horas_sueno: float = Field(..., ge=0, le=24)
    nivel_estres: int = Field(..., ge=1, le=10)
    nivel_animo: int = Field(..., ge=1, le=10)
    horas_estudio: float = Field(..., ge=0, le=24)
    
    # Campo booleano corregido (ya no es int)
    actividad_fisica: bool = False 
    
    # Nombre del campo corregido para coincidir con la base de datos y el frontend
    tipo_actividad: Optional[str] = None 
    
    alimentacion_resumen: Optional[str] = None
    emociones: Optional[str] = None
    nivel_concentracion: Optional[int] = Field(None, ge=1, le=10)
    rendimiento_percibido: Optional[int] = Field(None, ge=1, le=10)
    fecha: Optional[datetime] = None

class RegistroBienestarOut(RegistroBienestarCreate):
    id: int
    user_id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)

class EstadisticasAgregadas(BaseModel):
    promedio_estres: float
    promedio_sueno: float
    promedio_animo: float
    total_registros: int

# Alias para asegurar compatibilidad con todos los routers
RegistroCreate = RegistroBienestarCreate
RegistroOut = RegistroBienestarOut
RegistroBienestarResponse = RegistroBienestarOut