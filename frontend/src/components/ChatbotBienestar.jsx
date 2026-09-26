import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, ShieldCheck, Bot, Loader2, MessageCircle, X, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function ChatbotBienestar() {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar el widget flotante
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]); 
  
  const mensajesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Efecto para cargar el historial cuando se abre la página
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const historialDB = await aiService.obtenerHistorial();
        if (historialDB && historialDB.length > 0) {
          setChat(historialDB);
        } else {
          setChat([{ 
            id: 'welcome', 
            emisor: 'asistente', 
            contenido: 'Hola. Soy tu asistente de bienestar. ¿En qué te puedo orientar hoy sobre tus hábitos, estudio o descanso?', 
            disciplinas: ['IA'] 
          }]);
        }
      } catch (error) {
        console.error("Error al cargar historial", error);
        setChat([{ 
          id: 'welcome', 
          emisor: 'asistente', 
          contenido: 'Hola. Soy tu asistente de bienestar. ¿En qué te puedo orientar hoy sobre tus hábitos, estudio o descanso?', 
          disciplinas: ['IA'] 
        }]);
      }
    };
    cargarHistorial();
  }, []);

  // 2. Efecto para bajar el scroll automáticamente
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chat, loading, isOpen]);

  // 3. Función para enviar un nuevo mensaje
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const textoUsuario = mensaje;
    setMensaje(''); 
    
    const nuevoMsgUsuario = { id: Date.now(), emisor: 'usuario', contenido: textoUsuario };
    setChat(prev => [...prev, nuevoMsgUsuario]);
    setLoading(true);

    try {
      const respuestaIA = await aiService.enviarMensajeChat(textoUsuario);
      setChat(prev => [...prev, respuestaIA]);
    } catch (error) {
      console.error(error);
      setChat(prev => [...prev, { 
        id: Date.now(), 
        emisor: 'sistema', 
        contenido: 'Error de conexión. Intenta nuevamente más tarde.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 4. Función para limpiar el historial y empezar una nueva conversación
  const reiniciarChat = async () => {
    try {
      setLoading(true);
      await aiService.limpiarHistorial();
      // Restauramos el chat al mensaje de bienvenida
      setChat([{ 
        id: 'welcome', 
        emisor: 'asistente', 
        contenido: 'Hola. Soy tu asistente de bienestar. ¿En qué te puedo orientar hoy sobre tus hábitos, estudio o descanso?', 
        disciplinas: ['IA'] 
      }]);
    } catch (error) {
      console.error("Error al limpiar historial", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* VENTANA DEL CHAT (Se oculta/muestra con CSS) */}
      <div 
        className={`transition-all duration-300 transform origin-bottom-right mb-4 flex flex-col w-[380px] h-[550px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header Seguro con Botón de Cerrar y Limpiar Historial */}
        <div className="bg-sky-50 border-b border-sky-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sky-800 font-bold">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Bot className="w-5 h-5 text-sky-600" />
            </div>
            Asistente Virtual
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" title="Privado y Seguro" />
            
            {/* Botón para Limpiar Historial */}
            <button 
              onClick={reiniciarChat}
              title="Nueva Conversación"
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Botón para Cerrar Chat */}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ventana de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <div className="text-center mb-4">
            <span className="text-[10px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Orientación educativa. No reemplaza atención profesional.
            </span>
          </div>

          {chat.map(msg => (
            <div key={msg.id} className={`flex ${msg.emisor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                msg.emisor === 'usuario' 
                  ? 'bg-sky-600 text-white rounded-tr-none' 
                  : msg.emisor === 'sistema' 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                
                {msg.disciplinas && msg.disciplinas.length > 0 && (
                  <div className={`flex flex-wrap gap-1.5 mt-2 pt-2 border-t ${msg.emisor === 'usuario' ? 'border-sky-500' : 'border-slate-100'}`}>
                    {msg.disciplinas.map(d => (
                      <span key={d} className={`text-[9px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wide ${
                        msg.emisor === 'usuario' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {d}
                      </span>
                    ))}
                  </div>
                )}
                
                {msg.requiere_apoyo_profesional && (
                  <div className="mt-3 bg-rose-50 border border-rose-100 p-3 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" /> Alerta de Bienestar
                    </div>
                    <button className="text-[11px] font-semibold bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 transition-colors">
                      Ver Apoyo Universitario
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-sky-500" /> 
                <span className="text-xs font-medium">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        {/* Input de chat */}
        <form onSubmit={enviarMensaje} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            maxLength={800}
            placeholder="Pregunta sobre bienestar..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm transition-all"
          />
          <button 
            type="submit" 
            disabled={loading || !mensaje.trim()} 
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white p-2.5 rounded-full transition-colors shadow-sm flex items-center justify-center min-w-[44px]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* BOTÓN FLOTANTE (CÍRCULO) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg shadow-sky-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        title="Abrir Asistente de Bienestar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

    </div>
  );
}