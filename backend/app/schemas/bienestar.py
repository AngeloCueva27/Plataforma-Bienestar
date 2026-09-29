from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# ==========================================
# Lo que recibimos de React al crear
# ==========================================
class RegistroBienestarCreate(BaseModel):
    horasSueno: float = Field(ge=0.0)
    comidasRealizadas: int = Field(ge=0, le=10, default=3)
    vasosAgua: int = Field(ge=0, le=20, default=0)
    actividadFisica: str
    minutosActividadFisica: int = Field(ge=0, default=0)
    nivelEnergia: int = Field(ge=1, le=10, default=5)

    estadoAnimo: str
    nivelAnimo: int = Field(ge=1, le=10, default=5)
    nivelEstres: int = Field(ge=1, le=10)
    emocionesPredominantes: Optional[str] = None
    notas: Optional[str] = Field(None, max_length=300)

    horasEstudio: float = Field(ge=0.0)
    nivelConcentracion: int = Field(ge=1, le=10, default=5)
    rendimientoPercibido: int = Field(ge=1, le=10, default=5)
    pausasEstudio: bool = Field(default=False)

# ==========================================
# Lo que le devolvemos a React (Tolerante con NULLs viejos)
# ==========================================
class RegistroBienestarResponse(BaseModel):
    id: int
    usuario_id: int
    fecha: datetime = Field(validation_alias="fecha_registro")
    
    # Campos antiguos (Obligatorios)
    horas_sueno: float
    actividad_fisica: str
    nivel_estres: int
    estado_animo: str
    
    # Nuevos campos transdisciplinarios (Opcionales para no romper registros previos)
    comidas_realizadas: Optional[int] = 3
    vasos_agua: Optional[int] = 0
    minutos_actividad_fisica: Optional[int] = 0
    nivel_energia: Optional[int] = 5
    nivel_animo: Optional[int] = 5
    nivel_concentracion: Optional[int] = 5
    rendimiento_percibido: Optional[int] = 5
    pausas_estudio: Optional[bool] = False
    
    emociones: str = Field(validation_alias="estado_animo")
    horas_estudio: Optional[float] = 0.0
    notas: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)