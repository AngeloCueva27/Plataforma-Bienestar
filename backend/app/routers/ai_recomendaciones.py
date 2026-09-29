from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bienestar import RegistroBienestar
from app.models.ai_models import RecomendacionIA, FeedbackRecomendacion
from app.services.gemini_service import generar_recomendaciones_gemini
from typing import List

router = APIRouter(prefix="/api/ia/recomendaciones", tags=["Recomendaciones Inteligentes"])

@router.get("/")
def obtener_recomendaciones(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Obtiene las últimas recomendaciones generadas para el usuario."""
    recomendaciones = db.query(RecomendacionIA).filter(
        RecomendacionIA.usuario_id == current_user.id
    ).order_by(RecomendacionIA.fecha_creacion.desc()).limit(3).all()
    
    return recomendaciones

@router.post("/generar")
def generar_nuevas_recomendaciones(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Analiza el historial reciente y genera nuevas recomendaciones con Groq."""
    
    # 1. Obtener el historial reciente (últimos 7 registros)
    registros = db.query(RegistroBienestar).filter(
        RegistroBienestar.usuario_id == current_user.id
    ).order_by(RegistroBienestar.fecha_registro.desc()).limit(7).all()
    
    if len(registros) < 3:
        raise HTTPException(status_code=400, detail="Se necesitan al menos 3 registros para generar recomendaciones precisas.")
    
    # 2. Resumir los datos para la IA
    resumen_datos = []
    for r in registros:
        resumen_datos.append(
            f"Sueño: {r.horas_sueno}h, Estrés: {r.nivel_estres}/10, Estudio: {r.horas_estudio}h, "
            f"Físico: {r.actividad_fisica}, Nutrición: {r.comidas_realizadas} comidas, "
            f"Ánimo: {r.nivel_animo}/10"
        )
    texto_contexto = " | ".join(resumen_datos)
    
    # 3. Llamar al servicio de Groq
    try:
        ia_response = generar_recomendaciones_gemini(texto_contexto)
        recomendaciones_generadas = ia_response.get("recomendaciones", [])
        
        # 4. Guardar las nuevas recomendaciones en la base de datos
        nuevos_registros = []
        for rec in recomendaciones_generadas:
            nueva_rec = RecomendacionIA(
                usuario_id=current_user.id,
                categoria=rec.get("categoria", "General"),
                prioridad=rec.get("prioridad", "Media"),
                titulo=rec.get("titulo", "Recomendación"),
                contenido=rec.get("contenido", ""),
                disciplinas=rec.get("disciplinas", []),
                disclaimer=rec.get("disclaimer", "Consulta a un profesional si es necesario.")
            )
            db.add(nueva_rec)
            nuevos_registros.append(nueva_rec)
            
        db.commit()
        return {"mensaje": "Recomendaciones generadas con éxito."}
        
    except Exception as e:
        print(f"Error generando recomendaciones: {e}")
        raise HTTPException(status_code=500, detail="Error interno al generar las recomendaciones.")

@router.post("/{recomendacion_id}/feedback")
def enviar_feedback(recomendacion_id: int, payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Registra si la recomendación fue útil o no para el estudiante."""
    nuevo_feedback = FeedbackRecomendacion(
        recomendacion_id=recomendacion_id,
        usuario_id=current_user.id,
        tipo_feedback=payload.get("tipo_feedback"),
        comentario=payload.get("comentario")
    )
    db.add(nuevo_feedback)
    db.commit()
    return {"mensaje": "Feedback registrado exitosamente."}