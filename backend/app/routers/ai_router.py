from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai_models import ConversacionChat, MensajeChat
from app.schemas.ai_schemas import ChatMessageCreate, ChatMessageResponse
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/ai", tags=["Inteligencia Artificial"])

@router.post("/chat", response_model=ChatMessageResponse)
def enviar_mensaje_chat(
    payload: ChatMessageCreate, # <--- Usamos payload
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar si el usuario ya tiene una conversación abierta hoy, si no, crearla
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id,
        ConversacionChat.estado == "abierta"
    ).first()
    
    if not conversacion:
        conversacion = ConversacionChat(usuario_id=current_user.id)
        db.add(conversacion)
        db.commit()
        db.refresh(conversacion)

    # 2. Guardar el mensaje del usuario en la base de datos
    msg_usuario = MensajeChat(
        conversacion_id=conversacion.id,
        emisor="usuario",
        contenido=payload.contenido
    )
    db.add(msg_usuario)
    db.commit()

    # 3. Recuperar los últimos 5 mensajes para darle contexto a la IA
    ultimos_mensajes = db.query(MensajeChat).filter(
        MensajeChat.conversacion_id == conversacion.id
    ).order_by(MensajeChat.fecha_creacion.desc()).limit(5).all()
    
    # Formatear el historial (invertido para que esté en orden cronológico)
    contexto = "\n".join([f"{m.emisor}: {m.contenido}" for m in reversed(ultimos_mensajes)])

    # 4. Generar respuesta con la IA (usando Groq)
    try:
        # CORRECCIÓN 1: Pasamos 'payload.contenido'
        ia_response = GeminiService.generar_respuesta_chat(payload.contenido)
        
        # CORRECCIÓN 2: Extraemos los datos como diccionario JSON
        texto_final = ia_response.get("contenido", "Lo siento, no pude procesar tu mensaje.")
        
        if ia_response.get("requiere_apoyo_profesional"):
            texto_final += "\n\n🚨 Por favor, busca apoyo profesional. Te sugerimos contactar al departamento de bienestar de la universidad."

        # 5. Guardar la respuesta de la IA en la base de datos
        msg_ia = MensajeChat(
            conversacion_id=conversacion.id,
            emisor="asistente",
            contenido=texto_final,
            disciplinas=ia_response.get("disciplinas", []),
            requiere_apoyo_profesional=ia_response.get("requiere_apoyo_profesional", False)
        )
        db.add(msg_ia)
        db.commit()
        db.refresh(msg_ia)
        
        return msg_ia

    except Exception as e:
        print(f"Error en IA: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="El servicio de bienestar no está disponible temporalmente."
        )

@router.get("/historial")
def obtener_historial_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar si el usuario tiene una conversación abierta
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id,
        ConversacionChat.estado == "abierta"
    ).first()
    
    if not conversacion:
        return [] # Retorna lista vacía si no hay chat previo

    # 2. Traer todos los mensajes en orden cronológico
    mensajes = db.query(MensajeChat).filter(
        MensajeChat.conversacion_id == conversacion.id
    ).order_by(MensajeChat.fecha_creacion.asc()).all()
    
    return mensajes

@router.delete("/historial")
def limpiar_historial(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Buscamos la conversación abierta actual
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id,
        ConversacionChat.estado == "abierta"
    ).first()
    
    if conversacion:
        # En lugar de borrarla de la base de datos, simplemente la "cerramos"
        conversacion.estado = "cerrada"
        db.commit()
        
    return {"mensaje": "Historial limpiado. Listo para una nueva conversación."}