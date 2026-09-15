from datetime import datetime
from typing import Optional
from app.models.user import RoleEnum
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    nombre: str
    email: EmailStr
    ciclo: Optional[int] = Field(None, ge=1, le=10)
    rol: RoleEnum = RoleEnum.estudiante


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserOut(UserBase):
    id: int
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[str] = None
