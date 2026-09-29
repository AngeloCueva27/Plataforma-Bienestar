from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai_models import ConversacionChat, MensajeChat
from app.models.bienestar import RegistroBienestar
from app.schemas.ai_schemas import ChatMessageCreate, ChatMessageResponse
from app.services.gemini_service import generar_respuesta_chat

router = APIRouter(prefix="/ai", tags=["Inteligencia Artificial"])

@router.post("/chat", response_model=ChatMessageResponse)
def enviar_mensaje_chat(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Extraemos el texto de forma segura
    texto_usuario = payload.extraer_texto()

    # 1. MAGIA TRANSDISCIPLINARIA: Obtener el registro de bienestar más reciente
    ultimo_registro = db.query(RegistroBienestar).filter(
        RegistroBienestar.usuario_id == current_user.id
    ).order_by(RegistroBienestar.fecha_registro.desc()).first()
    
    contexto_bio = "Sin registros recientes."
    if ultimo_registro:
        contexto_bio = f"Sueño: {ultimo_registro.horas_sueno}h, Estrés: {ultimo_registro.nivel_estres}/10, Estudio: {ultimo_registro.horas_estudio}h, Ejercicio: {ultimo_registro.actividad_fisica}."

    # 2. Gestionar Conversación
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id,
        ConversacionChat.estado == "abierta"
    ).first()
    
    if not conversacion:
        conversacion = ConversacionChat(usuario_id=current_user.id)
        db.add(conversacion)
        db.commit()
        db.refresh(conversacion)

    # 3. Guardar mensaje del usuario
    msg_usuario = MensajeChat(
        conversacion_id=conversacion.id,
        emisor="usuario",
        contenido=texto_usuario  # <--- USAMOS EL TEXTO EXTRAÍDO
    )
    db.add(msg_usuario)
    db.commit()

    # 4. Recuperar los últimos 5 mensajes (Historial)
    ultimos_mensajes = db.query(MensajeChat).filter(
        MensajeChat.conversacion_id == conversacion.id
    ).order_by(MensajeChat.fecha_creacion.desc()).limit(5).all()
    
    contexto_historial = "\n".join([f"{m.emisor}: {m.contenido}" for m in reversed(ultimos_mensajes)])

    # 5. Llamar a la IA (Groq) inyectando el contexto biométrico secreto
    try:
        ia_response = generar_respuesta_chat(texto_usuario, contexto_historial, contexto_bio)
        texto_final = ia_response.get("contenido", "Lo siento, no pude procesar tu mensaje.")
        
        # 6. Guardar la respuesta de la IA
        msg_ia = MensajeChat(
            conversacion_id=conversacion.id,
            emisor="asistente",
            contenido=texto_final,
            disciplinas=ia_response.get("disciplinas", []),
            requiere_apoyo_profesional=ia_response.get("requiere_apoyo_profesional", False)
        )
        db.add(msg_ia)
        db.commit()
        
        # Formatear salida para Pydantic
        return {
            "contenido": msg_ia.contenido,
            "disciplinas": msg_ia.disciplinas,
            "requiere_apoyo_profesional": msg_ia.requiere_apoyo_profesional
        }

    except Exception as e:
        print(f"Error en IA: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="El servicio de bienestar no está disponible temporalmente."
        )

@router.get("/historial")
def obtener_historial_chat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id, ConversacionChat.estado == "abierta"
    ).first()
    if not conversacion: return []
    return db.query(MensajeChat).filter(MensajeChat.conversacion_id == conversacion.id).order_by(MensajeChat.fecha_creacion.asc()).all()

@router.delete("/historial")
def limpiar_historial(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversacion = db.query(ConversacionChat).filter(
        ConversacionChat.usuario_id == current_user.id, ConversacionChat.estado == "abierta"
    ).first()
    if conversacion:
        conversacion.estado = "cerrada"
        db.commit()
    return {"mensaje": "Historial limpiado."}