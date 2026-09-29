import os
import json
from dotenv import load_dotenv
from groq import Groq
from fastapi import HTTPException

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama3-70b-8192")

client = Groq(api_key=API_KEY) if API_KEY else None

SYSTEM_INSTRUCTION_RECOMENDACIONES = """
Eres un sistema experto en bienestar universitario transdisciplinario. Integras Psicología, Nutrición y Ciencias de la Educación.
Reglas ESTRICTAS:
1. NO emitas diagnósticos clínicos ni psicológicos.
2. NO prescribas tratamientos, medicamentos ni dietas.
3. Devuelve SIEMPRE un JSON válido con: "resumen" y un array de "recomendaciones" (cada una con: categoria, prioridad, titulo, contenido, disciplinas, disclaimer).
"""

SYSTEM_INSTRUCTION_CHAT = """
Eres un asistente virtual de bienestar universitario transdisciplinario. Integras Psicología, Nutrición y Ciencias de la Educación.
Reglas ESTRICTAS:
1. NO emitas diagnósticos médicos ni psicológicos. NO prescribas tratamientos.
2. Respuestas empáticas, prácticas y breves (máximo 700 caracteres).
3. PROTOCOLO DE CRISIS: Si el estudiante menciona autolesión, suicidio, violencia o emergencia, brinda apoyo empático muy breve, no des consejos generales y marca "requiere_apoyo_profesional": true.
4. Devuelve SIEMPRE un JSON con este formato exacto:
{
  "contenido": "Tu respuesta aquí.",
  "disciplinas": ["Psicología", "Nutrición", "Ciencias de la Educación", "IA"],
  "requiere_apoyo_profesional": false
}
"""

def generar_recomendaciones_gemini(datos_resumidos: str) -> dict:
    if not client: raise HTTPException(status_code=500, detail="IA no configurada.")
    prompt = f"Genera máximo 3 recomendaciones integrales basadas en estos patrones anónimos: {datos_resumidos}"
    try:
        res = client.chat.completions.create(
            messages=[{"role": "system", "content": SYSTEM_INSTRUCTION_RECOMENDACIONES}, {"role": "user", "content": prompt}],
            model=MODEL_NAME, temperature=0.3, response_format={"type": "json_object"}
        )
        return json.loads(res.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=503, detail="Servicio no disponible.")

def generar_respuesta_chat(mensaje: str, historial: str = "", contexto_biometrico: str = "") -> dict:
    if not client: raise HTTPException(status_code=500, detail="IA no configurada.")
    
    # Aquí ocurre la magia transdisciplinaria oculta:
    prompt_con_contexto = f"Contexto biométrico del estudiante (NO lo menciones directamente a menos que sea relevante): {contexto_biometrico}\n\nHistorial:\n{historial}\n\nMensaje actual del estudiante: {mensaje}\n\nResponde en JSON estricto."
    
    try:
        res = client.chat.completions.create(
            messages=[{"role": "system", "content": SYSTEM_INSTRUCTION_CHAT}, {"role": "user", "content": prompt_con_contexto}],
            model=MODEL_NAME, temperature=0.4, response_format={"type": "json_object"}
        )
        return json.loads(res.choices[0].message.content)
    except Exception as e:
        print(f"Error en Chat Groq: {e}")
        raise HTTPException(status_code=503, detail="Servicio de chat no disponible.")