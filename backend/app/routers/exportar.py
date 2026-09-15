import csv
import io
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.registro import RegistroBienestar
from app.models.user import User

router = APIRouter(prefix="/exportar", tags=["Exportación"])


@router.get("/csv")
def exportar_registros_csv(
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicial (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha final (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    usuario_actual: User = Depends(get_current_user),
):
    """Genera un archivo CSV con el historial de bienestar del usuario."""
    query = db.query(RegistroBienestar).filter(RegistroBienestar.user_id == usuario_actual.id)

    if fecha_inicio:
        query = query.filter(RegistroBienestar.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(RegistroBienestar.fecha <= fecha_fin)

    registros = query.order_by(RegistroBienestar.fecha.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Encabezados coincidentes con el modelo de base de datos
    writer.writerow([
        "Fecha",
        "Horas Sueño",
        "Nivel Estrés",
        "Nivel Ánimo",
        "Horas Estudio",
        "Actividad Física (min)",
    ])

    for r in registros:
        writer.writerow([
            r.fecha.strftime("%Y-%m-%d %H:%M") if r.fecha else "",
            r.horas_sueno,
            r.nivel_estres,
            r.nivel_animo,
            r.horas_estudio,
            r.actividad_fisica,
        ])

    output.seek(0)

    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
    )
    response.headers["Content-Disposition"] = "attachment; filename=historial_bienestar.csv"
    return response