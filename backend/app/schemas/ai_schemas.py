from pydantic import BaseModel, Field
from typing import List, Optional

# ==========================================
# 1. ESQUEMAS PARA RECOMENDACIONES IA
# ==========================================
class RecomendacionItemIA(BaseModel):
    categoria: str
    prioridad: str
    titulo: str
    contenido: str = Field(max_length=300)
    disciplinas: List[str]
    disclaimer: str

class RecomendacionResponseIA(BaseModel):
    resumen: str
    recomendaciones: List[RecomendacionItemIA]

class FeedbackCreate(BaseModel):
    tipo_feedback: str # util, no_util, reporte
    comentario: Optional[str] = None

# ==========================================
# 2. ESQUEMAS PARA EL CHATBOT TRANSDISCIPLINARIO
# ==========================================
class ChatMessageCreate(BaseModel):
    # Aceptamos ambas llaves posibles para evitar el error 422 de FastAPI
    mensaje: Optional[str] = Field(None, max_length=800)
    contenido: Optional[str] = Field(None, max_length=800, description="El mensaje del estudiante")

    def extraer_texto(self) -> str:
        """Devuelve el texto sin importar qué llave usó el frontend."""
        return self.mensaje if self.mensaje else (self.contenido or "")

class ChatMessageResponse(BaseModel):
    contenido: str
    disciplinas: Optional[List[str]] = []
    requiere_apoyo_profesional: bool = False