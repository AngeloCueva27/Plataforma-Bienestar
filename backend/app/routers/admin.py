import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.registro import RegistroBienestar
from app.core.security import require_roles

router = APIRouter(prefix="/admin", tags=["Administración"])

@router.get("/exportar-csv")
def exportar_datos_csv(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles([RoleEnum.administrador]))
):
    registros = db.query(RegistroBienestar).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Usuario_ID", "Fecha", "Horas_Sueño", "Nivel_Estrés",
        "Nivel_Ánimo", "Horas_Estudio", "Nivel_Concentración"
    ])
    
    for r in registros:
        writer.writerow([
            r.id, r.usuario_id, r.fecha, r.horas_sueno,
            r.nivel_estres, r.nivel_animo, r.horas_estudio, r.nivel_concentracion
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_bienestar.csv"}
    )
