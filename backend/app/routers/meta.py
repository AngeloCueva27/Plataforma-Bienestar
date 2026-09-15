from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User
from app.models.meta import MetaBienestar
from app.models.registro import RegistroBienestar
from app.core.security import get_current_user
from app.schemas.meta import (
    MetaBienestarCreate,
    MetaBienestarUpdate,
    MetaBienestarResponse,
    CumplimientoMetasResponse,
)

router = APIRouter(prefix="/metas", tags=["Metas de Bienestar"])


@router.get("/", response_model=MetaBienestarResponse)
def obtener_metas(
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user)
):
    """Obtiene las metas definidas por el usuario actual (crea por defecto si no existen)."""
    metas = db.query(MetaBienestar).filter(MetaBienestar.usuario_id == usuario_actual.id).first()
    if not metas:
        metas = MetaBienestar(usuario_id=usuario_actual.id)
        db.add(metas)
        db.commit()
        db.refresh(metas)
    return metas


@router.put("/", response_model=MetaBienestarResponse)
def actualizar_metas(
    datos_meta: MetaBienestarUpdate,
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user)
):
    """Actualiza los objetivos del usuario actual."""
    metas = db.query(MetaBienestar).filter(MetaBienestar.usuario_id == usuario_actual.id).first()
    if not metas:
        metas = MetaBienestar(usuario_id=usuario_actual.id)
        db.add(metas)

    for field, value in datos_meta.model_dump(exclude_unset=True).items():
        setattr(metas, field, value)

    db.commit()
    db.refresh(metas)
    return metas


@router.get("/cumplimiento", response_model=CumplimientoMetasResponse)
def evaluar_cumplimiento(
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user)
):
    """Compara los promedios del usuario contra sus metas definidas."""
    metas = db.query(MetaBienestar).filter(MetaBienestar.usuario_id == usuario_actual.id).first()
    if not metas:
        metas = MetaBienestar(usuario_id=usuario_actual.id)
        db.add(metas)
        db.commit()

    # Promedios de los registros de bienestar
    stats = db.query(
        func.avg(RegistroBienestar.horas_sueno).label("avg_sueno"),
        func.avg(RegistroBienestar.nivel_estres).label("avg_estres"),
        func.avg(RegistroBienestar.nivel_animo).label("avg_animo"),
        func.avg(RegistroBienestar.horas_estudio).label("avg_estudio"),
        func.avg(RegistroBienestar.actividad_fisica).label("avg_ejercicio"),
    ).filter(RegistroBienestar.user_id == usuario_actual.id).first()

    avg_sueno = stats.avg_sueno or 0.0
    avg_estres = stats.avg_estres or 0.0
    avg_animo = stats.avg_animo or 0.0
    avg_estudio = stats.avg_estudio or 0.0
    avg_ejercicio = stats.avg_ejercicio or 0.0

    evaluacion = {
        "meta_horas_sueno_lograda": avg_sueno >= metas.meta_horas_sueno,
        "meta_estres_controlado": avg_estres <= metas.meta_nivel_estres_max if stats.avg_estres else True,
        "meta_animo_logrado": avg_animo >= metas.meta_nivel_animo_min,
        "meta_estudio_lograda": avg_estudio >= metas.meta_horas_estudio,
        "meta_ejercicio_lograda": avg_ejercicio >= metas.meta_minutos_ejercicio,
    }

    exitos = sum(1 for cumplido in evaluacion.values() if cumplido)
    porcentaje = (exitos / len(evaluacion)) * 100.0

    return {**evaluacion, "porcentaje_cumplimiento_general": round(porcentaje, 2)}
