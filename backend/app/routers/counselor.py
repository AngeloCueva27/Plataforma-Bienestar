from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import requerir_roles
from app.models.registro import RegistroBienestar
from app.models.user import User, RoleEnum

router = APIRouter(prefix="/counselor", tags=["Panel de Consejería"])


@router.get("/resumen-global")
def obtener_resumen_estudiantil(
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(requerir_roles([RoleEnum.docente, RoleEnum.admin])),
):
    """Retorna métricas globales anónimas de estudiantes para docentes y administradores."""
    total_estudiantes = db.query(User).filter(User.rol == RoleEnum.estudiante).count()

    promedios = db.query(
        func.avg(RegistroBienestar.horas_sueno).label("avg_sueno"),
        func.avg(RegistroBienestar.nivel_estres).label("avg_estres"),
        func.avg(RegistroBienestar.nivel_animo).label("avg_animo"),
    ).first()

    return {
        "total_estudiantes_registrados": total_estudiantes,
        "promedio_global_sueno": round(promedios.avg_sueno or 0.0, 2),
        "promedio_global_estres": round(promedios.avg_estres or 0.0, 2),
        "promedio_global_animo": round(promedios.avg_animo or 0.0, 2),
    }
