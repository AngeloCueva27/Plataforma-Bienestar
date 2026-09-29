from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import json

from app.models.ai_models import AlertaBienestar
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bienestar import RegistroBienestar
from app.models.ai_models import AlertaBienestar
# Importamos el cliente de Groq que configuramos en tu servicio
from app.services.gemini_service import client, MODEL_NAME

router = APIRouter(prefix="/api/ia/alertas", tags=["Alertas Preventivas"])

@router.post("/evaluar")
def evaluar_y_generar_alertas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hace_7_dias = date.today() - timedelta(days=7)
    registros = db.query(RegistroBienestar).filter(
        RegistroBienestar.usuario_id == current_user.id,
        RegistroBienestar.fecha_registro >= hace_7_dias
    ).all()

    if not registros:
        return {"mensaje": "Sin registros suficientes para evaluar."}

    # =======================================================
    # 1. REGLAS DETERMINÍSTICAS (El backend decide, no la IA)
    # =======================================================
    descanso_bajo = sum(1 for r in registros if r.horas_sueno < 6.0)
    estres_alto = sum(1 for r in registros if r.nivel_estres >= 8)
    animo_bajo = sum(1 for r in registros if (r.nivel_animo or 5) <= 3)
    academica_riesgo = sum(1 for r in registros if (r.nivel_concentracion or 5) <= 4 and r.horas_estudio >= 4.0)

    alertas_detectadas = []
    if descanso_bajo >= 5: alertas_detectadas.append({"tipo": "Descanso", "nivel": "medio", "regla": "Sueño promedio menor de 6 horas en 5+ días"})
    if estres_alto >= 5: alertas_detectadas.append({"tipo": "Emocional", "nivel": "alto", "regla": "Estrés mayor o igual a 8 en 5+ días"})
    if animo_bajo >= 4: alertas_detectadas.append({"tipo": "Ánimo", "nivel": "medio", "regla": "Ánimo menor o igual a 3 en 4+ días"})
    if academica_riesgo >= 4: alertas_detectadas.append({"tipo": "Académica", "nivel": "medio", "regla": "Baja concentración con 4+ horas de estudio"})

    if not alertas_detectadas:
        return {"mensaje": "Métricas estables. No hay alertas preventivas."}

    # Alerta Integral (se cumplen 2 o más)
    if len(alertas_detectadas) >= 2:
        alerta_final = {"tipo": "Integral", "nivel": "alto", "regla": "Se cumplen múltiples alertas de riesgo simultáneas"}
    else:
        alerta_final = alertas_detectadas[0]

    # Evitar duplicados: Verificar si esta regla ya se alertó en los últimos 7 días
    alerta_previa = db.query(AlertaBienestar).filter(
        AlertaBienestar.usuario_id == current_user.id,
        AlertaBienestar.regla_activada == alerta_final["regla"],
        AlertaBienestar.fecha_creacion >= hace_7_dias
    ).first()

    if alerta_previa:
        return {"mensaje": "Alerta ya generada anteriormente. Evitando duplicados."}

    # =======================================================
    # 2. IA REDACTA EL MENSAJE (Groq)
    # =======================================================
    if not client: raise HTTPException(status_code=500, detail="IA no configurada.")
    
    system_inst = """
    Eres un especialista en bienestar. Redacta una alerta empática y preventiva en JSON estricto: 
    {
      "titulo": "Título breve", 
      "descripcion": "Descripción del patrón detectado sin asustar al usuario", 
      "recomendacion": "Consejo práctico", 
      "disciplinas": ["Psicología", "Nutrición", "Ciencias de la Educación", "IA"]
    }
    """
    prompt = f"El usuario activó esta regla matemática de riesgo: {alerta_final['regla']}. Redacta la alerta correspondiente."

    try:
        res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_inst}, {"role": "user", "content": prompt}],
            model=MODEL_NAME, temperature=0.3, response_format={"type": "json_object"}
        )
        redaccion = json.loads(res.choices[0].message.content)

        nueva_alerta = AlertaBienestar(
            usuario_id=current_user.id,
            tipo=alerta_final["tipo"],
            nivel=alerta_final["nivel"],
            regla_activada=alerta_final["regla"],
            titulo=redaccion.get("titulo", "Atención requerida"),
            descripcion=redaccion.get("descripcion", "Patrón de desgaste detectado."),
            recomendacion=redaccion.get("recomendacion", "Cuida tus hábitos de bienestar."),
            disciplinas=redaccion.get("disciplinas", ["IA"]),
            requiere_apoyo_profesional=(alerta_final["nivel"] == "alto")
        )
        db.add(nueva_alerta)
        db.commit()
        return {"mensaje": "Alerta preventiva generada exitosamente", "data": redaccion}
        
    except Exception as e:
        print(f"Error IA Alertas: {e}")
        raise HTTPException(status_code=503, detail="Error al generar la alerta.")

@router.get("/")
def obtener_alertas_activas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Devuelve las alertas que el estudiante aún no ha marcado como leídas."""
    return db.query(AlertaBienestar).filter(
        AlertaBienestar.usuario_id == current_user.id,
        AlertaBienestar.leida == False
    ).order_by(AlertaBienestar.fecha_creacion.desc()).all()

@router.patch("/{alerta_id}/leida")
def marcar_alerta_leida(alerta_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alerta = db.query(AlertaBienestar).filter(AlertaBienestar.id == alerta_id, AlertaBienestar.usuario_id == current_user.id).first()
    if alerta:
        alerta.leida = True
        db.commit()
    return {"mensaje": "Alerta marcada como leída"}

@router.delete("/{alerta_id}")
def eliminar_alerta(alerta_id: int, db: Session = Depends(get_db)):
    """Elimina definitivamente la alerta de la base de datos"""
    alerta = db.query(AlertaBienestar).filter(AlertaBienestar.id == alerta_id).first()
    
    if alerta:
        db.delete(alerta)
        db.commit()
        return {"mensaje": "Alerta eliminada correctamente"}
        
    return {"mensaje": "La alerta ya no existe"}