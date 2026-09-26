from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# ESQUEMAS PARA LA ESTRUCTURA JSON DE GEMINI
# ==========================================
class ChatResponseGemini(BaseModel):
    respuesta: str = Field(description="Respuesta al usuario en formato texto claro")
    disciplinas: list[str] = Field(description="Disciplinas involucradas (ej. Psicología, Ciencias de la Educación, IA)")
    tipo_respuesta: str = Field(description="orientacion_general, riesgo_detectado, fuera_de_alcance")
    requiere_apoyo_profesional: bool = Field(description="True si se detecta crisis o riesgo físico/emocional grave")
    mensaje_apoyo: Optional[str] = Field(description="Mensaje sugiriendo ayuda profesional si se requiere, null en caso contrario")

# ==========================================
# ESQUEMAS PARA LA API REST (Frontend)
# ==========================================
class ChatMessageCreate(BaseModel):
    contenido: str = Field(max_length=800)

class ChatMessageResponse(BaseModel):
    id: int
    emisor: str
    contenido: str
    disciplinas: Optional[list[str]] = None
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True