from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bienestar import RegistroBienestar
from app.models.user import User
from app.core.security import get_current_user

# Creamos el router. Como en main.py le pusimos prefix="/bienestar", 
# la ruta final de esto será "/bienestar/estadisticas"
router = APIRouter(tags=["estadisticas"])

@router.get("/estadisticas")
def obtener_estadisticas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Obtener todos los registros del usuario actual
    registros = db.query(RegistroBienestar).filter(
        RegistroBienestar.usuario_id == current_user.id
    ).all()
    
    total = len(registros)
    
    # Si no hay registros, devolvemos todo en cero para no causar errores matemáticos
    if total == 0:
        return {
            "promedio_sueno": 0,
            "promedio_estres": 0,
            "promedio_estudio": 0,
            "total_registros": 0
        }
        
    # Calculamos las sumas totales
    suma_sueno = sum(r.horas_sueno for r in registros if r.horas_sueno is not None)
    suma_estres = sum(r.nivel_estres for r in registros if r.nivel_estres is not None)
    suma_estudio = sum(r.horas_estudio for r in registros if r.horas_estudio is not None)
    
    # Calculamos los promedios redondeados a 1 decimal
    return {
        "promedio_sueno": round(suma_sueno / total, 1),
        "promedio_estres": round(suma_estres / total, 1),
        "promedio_estudio": round(suma_estudio / total, 1),
        "total_registros": total
    }