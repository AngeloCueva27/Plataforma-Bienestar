from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.registro import RegistroBienestar

router = APIRouter(
    prefix="/bienestar",
    tags=["Bienestar"]
)

# --- Esquemas Pydantic ---

class BienestarCreate(BaseModel):
    horas_sueno: float = Field(..., ge=0, le=24)
    nivel_estres: int = Field(..., ge=1, le=10)
    nivel_animo: int = Field(..., ge=1, le=10)
    horas_estudio: float = Field(..., ge=0, le=24)
    
    # SOLUCIÓN: Cambiado a bool
    actividad_fisica: Optional[bool] = False 
    
    actividad_fisica_tipo: Optional[str] = None
    alimentacion_resumen: Optional[str] = None
    emociones: Optional[str] = None
    nivel_concentracion: Optional[int] = Field(None, ge=1, le=10)
    rendimiento_percibido: Optional[int] = Field(None, ge=1, le=10)
    fecha: Optional[datetime] = None


class BienestarUpdate(BaseModel):
    horas_sueno: Optional[float] = Field(None, ge=0, le=24)
    
    # SOLUCIÓN: Cambiado a bool
    actividad_fisica: Optional[bool] = None 
    
    actividad_fisica_tipo: Optional[str] = None
    alimentacion_resumen: Optional[str] = None
    nivel_estres: Optional[int] = Field(None, ge=1, le=10)
    nivel_animo: Optional[int] = Field(None, ge=1, le=10)
    emociones: Optional[str] = None
    horas_estudio: Optional[float] = Field(None, ge=0, le=24)
    nivel_concentracion: Optional[int] = Field(None, ge=1, le=10)
    rendimiento_percibido: Optional[int] = Field(None, ge=1, le=10)


class BienestarResponse(BienestarCreate):
    id: int
    user_id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)


class EstadisticasBienestar(BaseModel):
    promedio_horas_sueno: float
    promedio_nivel_estres: float
    promedio_nivel_animo: float
    promedio_horas_estudio: float
    total_registros: int


# --- Endpoints ---

@router.post("/registrar", response_model=BienestarResponse, status_code=status.HTTP_201_CREATED)
def registrar_bienestar(
    datos: BienestarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = datos.model_dump(exclude_unset=True)
    
    # Filtra únicamente las columnas definidas en el modelo de SQLAlchemy
    columnas_validas = {col.key for col in RegistroBienestar.__table__.columns}
    datos_filtrados = {k: v for k, v in payload.items() if k in columnas_validas}

    nuevo_registro = RegistroBienestar(
        **datos_filtrados,
        user_id=current_user.id
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro


@router.get("/historial", response_model=List[BienestarResponse])
def obtener_historial(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(RegistroBienestar)
        .filter(RegistroBienestar.user_id == current_user.id)
        .order_by(RegistroBienestar.fecha.desc())
        .all()
    )


@router.get("/estadisticas", response_model=EstadisticasBienestar)
def obtener_estadisticas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = db.query(
        func.avg(RegistroBienestar.horas_sueno).label("avg_sueno"),
        func.avg(RegistroBienestar.nivel_estres).label("avg_estres"),
        func.avg(RegistroBienestar.nivel_animo).label("avg_animo"),
        func.avg(RegistroBienestar.horas_estudio).label("avg_estudio"),
        func.count(RegistroBienestar.id).label("total")
    ).filter(RegistroBienestar.user_id == current_user.id).first()

    if not stats or stats.total == 0:
        return {
            "promedio_horas_sueno": 0.0,
            "promedio_nivel_estres": 0.0,
            "promedio_nivel_animo": 0.0,
            "promedio_horas_estudio": 0.0,
            "total_registros": 0
        }

    return {
        "promedio_horas_sueno": round(stats.avg_sueno or 0.0, 2),
        "promedio_nivel_estres": round(stats.avg_estres or 0.0, 2),
        "promedio_nivel_animo": round(stats.avg_animo or 0.0, 2),
        "promedio_horas_estudio": round(stats.avg_estudio or 0.0, 2),
        "total_registros": stats.total
    }


@router.put("/{registro_id}", response_model=BienestarResponse)
def actualizar_registro(
    registro_id: int,
    datos: BienestarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    registro = db.query(RegistroBienestar).filter(
        RegistroBienestar.id == registro_id,
        RegistroBienestar.user_id == current_user.id
    ).first()

    if not registro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de bienestar no encontrado"
        )

    datos_actualizar = datos.model_dump(exclude_unset=True)
    columnas_validas = {col.key for col in RegistroBienestar.__table__.columns}
    
    for clave, valor in datos_actualizar.items():
        if clave in columnas_validas:
            setattr(registro, clave, valor)

    db.commit()
    db.refresh(registro)
    return registro


@router.delete("/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_registro(
    registro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    registro = db.query(RegistroBienestar).filter(
        RegistroBienestar.id == registro_id,
        RegistroBienestar.user_id == current_user.id
    ).first()

    if not registro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de bienestar no encontrado"
        )

    db.delete(registro)
    db.commit()
    return None