from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.bienestar import RegistroBienestar
from app.models.user import User
from app.schemas.estadisticas import HistoricoRespuesta, PromediosSemanales, PuntoTendencia

router = APIRouter(prefix="/estadisticas", tags=["Estadísticas"])


@router.get("/semanal", response_model=PromediosSemanales)
def obtener_promedios_semanales(
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user),
):
    """Calcula los promedios de las métricas clave en los últimos 7 días."""
    hace_7_dias = date.today() - timedelta(days=7)

    stats = (
        db.query(
            func.avg(RegistroBienestar.horas_sueno).label("avg_sueno"),
            func.avg(RegistroBienestar.nivel_estres).label("avg_estres"),
            func.avg(RegistroBienestar.nivel_animo).label("avg_animo"),
            func.avg(RegistroBienestar.horas_estudio).label("avg_estudio"),
            func.avg(RegistroBienestar.actividad_fisica).label("avg_ejercicio"),
            func.count(RegistroBienestar.id).label("count"),
        )
        .filter(
            RegistroBienestar.user_id == usuario_actual.id,
            RegistroBienestar.fecha >= hace_7_dias,
        )
        .first()
    )

    return PromediosSemanales(
        promedio_horas_sueno=round(stats.avg_sueno or 0.0, 2),
        promedio_nivel_estres=round(stats.avg_estres or 0.0, 2),
        promedio_nivel_animo=round(stats.avg_animo or 0.0, 2),
        promedio_horas_estudio=round(stats.avg_estudio or 0.0, 2),
        promedio_ejercicio_minutos=round(stats.avg_ejercicio or 0.0, 2),
        total_registros=stats.count or 0,
    )


@router.get("/historico", response_model=HistoricoRespuesta)
def obtener_historico(
    dias: int = 14,
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user),
):
    """Obtiene una lista cronológica de registros para alimentar gráficos de tendencia."""
    fecha_inicio = date.today() - timedelta(days=dias)

    registros = (
        db.query(RegistroBienestar)
        .filter(
            RegistroBienestar.user_id == usuario_actual.id,
            RegistroBienestar.fecha >= fecha_inicio,
        )
        .order_by(RegistroBienestar.fecha.asc())
        .all()
    )

    puntos = [
        PuntoTendencia(
            fecha=r.fecha,
            horas_sueno=r.horas_sueno,
            nivel_estres=r.nivel_estres,
            nivel_animo=r.nivel_animo,
            horas_estudio=r.horas_estudio,
        )
        for r in registros
    ]

    return HistoricoRespuesta(dias=puntos)
