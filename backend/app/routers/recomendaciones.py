from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, cast, Integer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.bienestar import RegistroBienestar
from app.models.user import User
from app.schemas.recomendaciones import Recomendacion, RecomendacionesResponse

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones"])

@router.get("/", response_model=RecomendacionesResponse)
def generar_recomendaciones(
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user),
):
    """Analiza los últimos 7 días y genera recomendaciones automáticas."""
    hace_7_dias = date.today() - timedelta(days=7)

    stats = (
        db.query(
            func.avg(RegistroBienestar.horas_sueno).label("avg_sueno"),
            func.avg(RegistroBienestar.nivel_estres).label("avg_estres"),
            func.avg(RegistroBienestar.horas_estudio).label("avg_estudio"),
            # AQUÍ ESTÁ LA CORRECCIÓN: Sumamos los días en lugar de promediarlos
            func.sum(cast(RegistroBienestar.actividad_fisica, Integer)).label("dias_ejercicio"),
            func.count(RegistroBienestar.id).label("count"),
        )
        .filter(
            RegistroBienestar.user_id == usuario_actual.id,
            RegistroBienestar.fecha >= hace_7_dias,
        )
        .first()
    )

    items = []

    if not stats or stats.count == 0:
        items.append(
            Recomendacion(
                categoria="general",
                nivel="info",
                titulo="Registra tu día",
                mensaje="Aún no tienes registros esta semana. Añade tu primer registro diario para recibir diagnósticos.",
            )
        )
        return RecomendacionesResponse(total=len(items), recomendaciones=items)

    avg_sueno = stats.avg_sueno or 0.0
    avg_estres = stats.avg_estres or 0.0
    avg_estudio = stats.avg_estudio or 0.0
    dias_ejercicio = stats.dias_ejercicio or 0

    # Evaluación de Sueño
    if avg_sueno < 6.0:
        items.append(
            Recomendacion(
                categoria="sueno",
                nivel="danger",
                titulo="Déficit de descanso",
                mensaje=f"Tu promedio de sueño ({round(avg_sueno, 1)}h) es bajo. Intenta dormir al menos 7-8 horas para sostener el rendimiento cognitivo.",
            )
        )

    # Evaluación de Estrés
    if avg_estres >= 6.0:
        items.append(
            Recomendacion(
                categoria="estres",
                nivel="warning",
                titulo="Nivel de estrés elevado",
                mensaje=f"Tu estrés promedio está en {round(avg_estres, 1)}/10. Realiza pausas activas para despejar la mente.",
            )
        )

    # Evaluación de Estudio vs Descanso
    if avg_estudio > 8.0 and avg_sueno < 7.0:
        items.append(
            Recomendacion(
                categoria="estudio",
                nivel="warning",
                titulo="Sobrepeso académico",
                mensaje="Estás estudiando más de 8 horas diarias con poco descanso. El riesgo de sobrecarga es alto.",
            )
        )

    # Evaluación de Actividad Física
    if dias_ejercicio < 3:
        items.append(
            Recomendacion(
                categoria="actividad",
                nivel="info",
                titulo="Mantente en movimiento",
                mensaje=f"Solo has hecho ejercicio {dias_ejercicio} días esta semana. Una caminata breve ayuda a la salud física.",
            )
        )

    # Mensaje positivo si todo está dentro de parámetros saludables
    if not items:
        items.append(
            Recomendacion(
                categoria="general",
                nivel="info",
                titulo="¡Buen equilibrio!",
                mensaje="Tus métricas de la semana se encuentran dentro de rangos equilibrados. ¡Sigue así!",
            )
        )

    return RecomendacionesResponse(total=len(items), recomendaciones=items)