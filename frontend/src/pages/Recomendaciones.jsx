import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Sparkles, AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export default function Recomendaciones() {
  const [consejos, setConsejos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecomendaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recomendaciones');
      // Accedemos a la lista desde la propiedad recomendaciones
      setConsejos(response.data.recomendaciones || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecomendaciones();
  }, []);

  const getEstilosPorNivel = (nivel) => {
    switch (nivel) {
      case 'danger':
        return {
          card: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />,
        };
      case 'warning':
        return {
          card: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />,
        };
      case 'info':
      default:
        return {
          card: 'bg-sky-50 border-sky-200 text-sky-900',
          icon: <Info className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" /> Consejero de Bienestar
          </h1>
          <p className="text-slate-500 text-sm">Diagnóstico y sugerencias personalizadas de los últimos 7 días.</p>
        </div>
        <button
          onClick={fetchRecomendaciones}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-slate-500 font-medium">Analizando hábitos de la semana...</div>
        ) : consejos.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-slate-500">No hay recomendaciones disponibles en este momento.</div>
        ) : (
          consejos.map((item, index) => {
            const estilo = getEstilosPorNivel(item.nivel);
            return (
              <div
                key={index}
                className={`p-5 rounded-xl border flex gap-4 items-start shadow-sm transition ${estilo.card}`}
              >
                {estilo.icon}
                <div>
                  <h3 className="font-bold text-base mb-1">{item.titulo}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{item.mensaje}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}