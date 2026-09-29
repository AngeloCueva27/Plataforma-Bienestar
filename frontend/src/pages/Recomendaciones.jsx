import { useState, useEffect } from 'react';
import { RefreshCw, ThumbsUp, ThumbsDown, Flag, Info, Brain, Activity, Utensils, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api'; // Ajusta según la ruta real de tu instancia de Axios

export default function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [feedbackEnviado, setFeedbackEnviado] = useState({});

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
      setCargando(true);
      const res = await api.get('/api/ia/recomendaciones/');
      setRecomendaciones(res.data);
    } catch (err) {
      console.error("Error al cargar recomendaciones:", err);
      setError("No pudimos cargar tus recomendaciones previas.");
    } finally {
      setCargando(false);
    }
  };

  const generarNuevas = async () => {
    try {
      setGenerando(true);
      setError('');
      // Llama a Groq en el backend para analizar los últimos 7 días
      await api.post('/api/ia/recomendaciones/generar');
      await cargarRecomendaciones(); // Recargar la lista para mostrar las nuevas
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "No fue posible generar la orientación en este momento. Inténtalo nuevamente más tarde.");
    } finally {
      setGenerando(false);
    }
  };

  const enviarFeedback = async (id, tipo) => {
    try {
      await api.post(`/api/ia/recomendaciones/${id}/feedback`, {
        tipo_feedback: tipo,
        comentario: ""
      });
      // Marcamos esta tarjeta específica para que la UI muestre el agradecimiento
      setFeedbackEnviado(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error("Error al enviar feedback:", err);
    }
  };

  const obtenerIconoCategoria = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'psicologia': case 'bienestar_emocional': return <Brain className="w-6 h-6 text-purple-600" />;
      case 'nutricion': return <Utensils className="w-6 h-6 text-green-600" />;
      case 'academico': case 'ciencias de la educacion': return <BookOpen className="w-6 h-6 text-orange-600" />;
      default: return <Activity className="w-6 h-6 text-blue-600" />;
    }
  };

  const obtenerColorPrioridad = (prioridad) => {
    if (prioridad === 'alta') return 'bg-red-100 text-red-700 border-red-200';
    if (prioridad === 'media') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Encabezado y Control */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orientación Inteligente</h1>
          <p className="text-slate-500 text-sm mt-1">
            Recomendaciones transdisciplinarias basadas en tus patrones recientes de bienestar.
          </p>
        </div>
        <button
          onClick={generarNuevas}
          disabled={generando}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <RefreshCw className={`w-5 h-5 ${generando ? 'animate-spin' : ''}`} />
          {generando ? 'Analizando patrones...' : 'Generar Recomendaciones'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Lista de Recomendaciones */}
      {cargando ? (
        <div className="text-center py-12 text-slate-400 font-medium">Cargando orientación...</div>
      ) : recomendaciones.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">Aún no hay recomendaciones</h3>
          <p className="text-slate-400 text-sm mt-1">Completa al menos 3 registros diarios y presiona el botón generar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recomendaciones.map((rec) => (
            <div key={rec.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              
              {/* Cabecera de Tarjeta */}
              <div className="p-5 pb-4 border-b border-slate-100 flex gap-4 items-start">
                <div className="p-3 bg-slate-50 rounded-xl">
                  {obtenerIconoCategoria(rec.categoria)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 leading-tight">{rec.titulo}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${obtenerColorPrioridad(rec.prioridad)}`}>
                      Prioridad {rec.prioridad}
                    </span>
                  </div>
                  {/* Chips Disciplinarios */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rec.disciplinas?.map((disc, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {disc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-5 flex-1 bg-slate-50/50">
                <p className="text-slate-700 text-sm leading-relaxed">{rec.contenido}</p>
              </div>

              {/* Aviso legal (Disclaimer) */}
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">
                  {rec.disclaimer || "Esta recomendación es orientativa y no reemplaza la atención de un profesional."}
                </p>
              </div>

              {/* Sistema de Feedback */}
              <div className="p-4 border-t border-slate-100 bg-white">
                {feedbackEnviado[rec.id] ? (
                  <p className="text-sm font-medium text-emerald-600 text-center py-1">
                    ✓ Gracias por ayudarnos a mejorar.
                  </p>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">¿Te fue útil?</span>
                    <div className="flex gap-2">
                      <button onClick={() => enviarFeedback(rec.id, 'util')} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Útil">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => enviarFeedback(rec.id, 'no_util')} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="No me sirvió">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button onClick={() => enviarFeedback(rec.id, 'reporte')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reportar como inapropiado">
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}