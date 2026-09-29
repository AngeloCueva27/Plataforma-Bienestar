from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai_models import RecomendacionIA, AlertaBienestar, ValidacionEspecialista
from app.schemas.validacion_especialista import ValidacionEspecialistaCreate

router = APIRouter(prefix="/api/especialista/validaciones", tags=["Panel Especialistas"])

@router.get("/casos-pendientes")
def obtener_casos_anonimos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Obtiene recomendaciones y alertas recientes de forma anónima para revisión."""
    # Nota: Aquí deberías validar que current_user.rol == 'Especialista'
    
    recomendaciones = db.query(RecomendacionIA).order_by(RecomendacionIA.fecha_creacion.desc()).limit(20).all()
    
    casos = []
    for rec in recomendaciones:
        casos.append({
            "codigo_anonimo": f"EST-ANON-{rec.usuario_id}",
            "tipo": "Recomendación IA",
            "categoria": rec.categoria,
            "disciplinas": rec.disciplinas,
            "contenido_ia": rec.contenido,
            "id_referencia": rec.id
        })
    return casos

@router.post("/")
def registrar_validacion(
    payload: ValidacionEspecialistaCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Guarda la aprobación o corrección del especialista."""
    nueva_validacion = ValidacionEspecialista(
        especialista_id=current_user.id,
        recomendacion_id=payload.recomendacion_id,
        alerta_id=payload.alerta_id,
        estado=payload.estado,
        observacion=payload.observacion
    )
    db.add(nueva_validacion)
    db.commit()
    return {"mensaje": "Validación registrada correctamente."}