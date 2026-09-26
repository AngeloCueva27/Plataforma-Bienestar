import re
import time
from sqlalchemy.orm import Session
from app.models.ai_models import AuditoriaIA

class SafetyService:
    @staticmethod
    def check_prompt_injection(user_input: str) -> bool:
        if not user_input:
            return False
            
        patrones_sospechosos = [
            r"ignora (todas )?las instrucciones",
            r"olvida lo anterior",
            r"actúa como (un hacker|sin restricciones)",
            r"muestra (tu|el) prompt",
            r"revela (tu|la) api key",
            r"system prompt"
        ]
        texto = user_input.lower()
        for patron in patrones_sospechosos:
            if re.search(patron, texto):
                return True
        return False

    @staticmethod
    def registrar_auditoria(db: Session, usuario_id: int, modulo: str, accion: str, estado: str, inicio_ms: float = None):
        tiempo = (time.time() - inicio_ms) * 1000 if inicio_ms else None
        audit = AuditoriaIA(
            usuario_id=usuario_id, 
            modulo=modulo, 
            accion=accion,
            estado=estado, 
            tiempo_respuesta_ms=tiempo
        )
        db.add(audit)
        db.commit()