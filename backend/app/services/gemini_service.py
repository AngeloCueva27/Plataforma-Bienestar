import os
import json
from groq import Groq

# Inicializamos el cliente de Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

class GeminiService:
    @staticmethod
    def generar_respuesta_chat(mensaje_usuario: str):
        # Instrucciones estrictas para que devuelva el mismo formato que ya espera tu React
        system_prompt = """Eres un asistente de bienestar universitario. 
        Debes responder SIEMPRE en formato JSON válido con esta estructura exacta:
        {
            "contenido": "Tu respuesta empática, corta y útil aquí",
            "disciplinas": ["PalabraClave1", "PalabraClave2"],
            "requiere_apoyo_profesional": false
        }
        Si el usuario menciona taquicardia, autolesiones, depresión severa o pánico, establece requiere_apoyo_profesional en true y da un mensaje de apoyo derivándolo a profesionales.
        """
        
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": mensaje_usuario}
                ],
                response_format={"type": "json_object"} # Obligamos a devolver JSON perfecto
            )
            
            # Extraemos y convertimos el texto a diccionario de Python
            respuesta_str = response.choices[0].message.content
            return json.loads(respuesta_str)
            
        except Exception as e:
            print(f"Error en Groq AI: {e}")
            raise e