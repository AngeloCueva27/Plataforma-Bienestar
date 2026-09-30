from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# --- Esquemas Pydantic adicionales ---
class UsuarioAdminResponse(BaseModel):
    id: int
    email: str
    rol: str  # <-- CAMBIO 1: Agregamos el rol al esquema
    is_active: bool = True
    es_admin: bool = False

    model_config = ConfigDict(from_attributes=True)

class PasswordResetRequest(BaseModel):
    user_id: int
    new_password: str


# --- Endpoints ---

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Validar que el correo no esté registrado
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )

    # 2. Generar el hash de la contraseña
    hashed_pwd = get_password_hash(user.password)

    # 3. Crear y guardar el usuario
    nuevo_usuario = User(
        nombre=user.nombre,
        email=user.email,
        hashed_password=hashed_pwd,
        ciclo=user.ciclo, # <-- CORRECCIÓN: Se envía como entero, no como string
        rol=user.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Buscar usuario por email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo o contraseña incorrectos."
        )

    # 2. Crear el token JWT
    rol_usuario = user.rol.value if hasattr(user.rol, 'value') else user.rol
    
    access_token = create_access_token(data={
        "sub": user.email,
        "rol": rol_usuario,
        "nombre": user.nombre
    })
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/usuarios", response_model=List[UsuarioAdminResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    usuarios = db.query(User).all()
    
    resultado = []
    for u in usuarios:
        es_admin_val = getattr(
            u, 
            "es_admin", 
            getattr(u, "is_admin", getattr(u, "is_superuser", u.rol == "admin" if hasattr(u, "rol") else False))
        )
        
        # <-- CAMBIO 2: Extraemos el valor del rol de forma segura
        rol_val = u.rol.value if hasattr(u.rol, 'value') else getattr(u, "rol", "estudiante")
        
        resultado.append({
            "id": u.id,
            "email": u.email,
            "rol": rol_val,  # <-- CAMBIO 3: Se lo enviamos a React
            "is_active": getattr(u, "is_active", True),
            "es_admin": es_admin_val
        })
        
    return resultado


@router.put("/reset-password")
def reset_password(
    req: PasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rol_actual = current_user.rol.value if hasattr(current_user.rol, 'value') else current_user.rol
    if rol_actual != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción."
        )
        
    user_to_update = db.query(User).filter(User.id == req.user_id).first()
    if not user_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
        
    user_to_update.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    return {"message": f"Contraseña actualizada exitosamente para el usuario {user_to_update.email}"}