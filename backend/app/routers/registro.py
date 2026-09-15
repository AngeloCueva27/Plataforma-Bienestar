from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.registro import RegistroBienestar
from app.schemas.registro import RegistroCreate, RegistroOut

router = APIRouter(prefix="/registros", tags=["Registros de Bienestar"])


@router.post("/", response_model=RegistroOut)
def crear_registro(registro: RegistroCreate, db: Session = Depends(get_db)):
    # Desestructuramos el esquema de forma segura
    nuevo_registro = RegistroBienestar(
        **registro.model_dump(), 
        user_id=1 # (O el ID del usuario autenticado que estés usando)
    )
    
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro