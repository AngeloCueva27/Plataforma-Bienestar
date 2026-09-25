from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.bienestar import RegistroBienestar
from app.schemas.bienestar import RegistroBienestarCreate, RegistroBienestarResponse
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/bienestar", tags=["bienestar"])

@router.post("/registro", response_model=RegistroBienestarResponse, status_code=status.HTTP_201_CREATED)
def crear_registro(
    registro: RegistroBienestarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nuevo_registro = RegistroBienestar(
        usuario_id=current_user.id,
        estado_animo=registro.estadoAnimo,
        nivel_estres=registro.nivelEstres,
        horas_sueno=registro.horasSueno,
        horas_estudio=registro.horasEstudio,
        actividad_fisica=registro.actividadFisica,
        notas=registro.notas
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@router.get("/historial", response_model=List[RegistroBienestarResponse])
def obtener_historial(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    registros = db.query(RegistroBienestar).filter(
        RegistroBienestar.usuario_id == current_user.id
    ).order_by(RegistroBienestar.fecha_registro.desc()).all()
    
    return registros