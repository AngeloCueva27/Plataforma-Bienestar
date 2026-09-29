from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.bienestar import RegistroBienestar
from app.schemas.bienestar import RegistroBienestarCreate, RegistroBienestarResponse
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/bienestar", tags=["bienestar"])

# CAMBIO 1: La ruta ahora es "/registrar" para que coincida con React
@router.post("/registrar", response_model=RegistroBienestarResponse, status_code=status.HTTP_201_CREATED)
def crear_registro(
    registro: RegistroBienestarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # CAMBIO 2: Mapeamos TODOS los campos transdisciplinarios hacia la Base de Datos
    nuevo_registro = RegistroBienestar(
        usuario_id=current_user.id,
        
        # A. Físico y Nutricional
        horas_sueno=registro.horasSueno,
        comidas_realizadas=registro.comidasRealizadas,
        vasos_agua=registro.vasosAgua,
        actividad_fisica=registro.actividadFisica,
        minutos_actividad_fisica=registro.minutosActividadFisica,
        nivel_energia=registro.nivelEnergia,
        
        # B. Emocional
        estado_animo=registro.estadoAnimo,
        nivel_animo=registro.nivelAnimo,
        nivel_estres=registro.nivelEstres,
        emociones_predominantes=registro.emocionesPredominantes,
        notas=registro.notas,
        
        # C. Académico
        horas_estudio=registro.horasEstudio,
        nivel_concentracion=registro.nivelConcentracion,
        rendimiento_percibido=registro.rendimientoPercibido,
        pausas_estudio=registro.pausasEstudio
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