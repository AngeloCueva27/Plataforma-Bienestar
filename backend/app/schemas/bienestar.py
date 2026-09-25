from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# Lo que recibimos de React al crear
class RegistroBienestarCreate(BaseModel):
    estadoAnimo: str
    nivelEstres: int
    horasSueno: float
    horasEstudio: float
    actividadFisica: str
    notas: Optional[str] = None

# Lo que le devolvemos a React para el historial
class RegistroBienestarResponse(BaseModel):
    id: int
    usuario_id: int
    
    # React espera "fecha"
    fecha: datetime = Field(validation_alias="fecha_registro")
    
    # React espera estos con guion bajo
    horas_sueno: float
    nivel_estres: int
    horas_estudio: float
    # React espera un string "Sí" o "No" para actividad, pero la BD guarda un string
    actividad_fisica: str
    
    # React pide emociones y horas_estudio (que no están en tu BD). 
    # Creamos variables "ficticias" leyendo de otros lados para que la tabla no se rompa
    emociones: str = Field(validation_alias="estado_animo") # Usamos el estado_animo como emociones
    horas_estudio: float = 0.0 # No tenemos esto en la BD, mandamos 0
    notas: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)