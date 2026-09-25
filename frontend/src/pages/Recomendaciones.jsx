import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Lightbulb, AlertTriangle, Info, HeartPulse, Brain, Moon, BookOpen } from 'lucide-react';

export default function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecomendaciones = async () => {
      try {
        const res = await api.get('/recomendaciones/');
        setRecomendaciones(res.data.recomendaciones || []);
      } catch (err) {
        console.error('Error al cargar recomendaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendaciones();
  }, []);

  // Función para asignar colores e íconos dinámicamente según el nivel y categoría
  const getEstilos = (nivel, categoria) => {
    let estilos = { bg: 'bg-slate-50', border: 'border-slate-200', icon: <Info className="text-slate-500" />, text: 'text-slate-800' };

    if (nivel === 'danger') {
      estilos = { bg: 'bg-rose-50', border: 'border-rose-200', icon: <AlertTriangle className="text-rose-600" />, text: 'text-rose-900' };
    } else if (nivel === 'warning') {
      estilos = { bg: 'bg-amber-50', border: 'border-amber-200', icon: <Lightbulb className="text-amber-600" />, text: 'text-amber-900' };
    } else if (nivel === 'info') {
      estilos = { bg: 'bg-sky-50', border: 'border-sky-200', icon: <Info className="text-sky-600" />, text: 'text-sky-900' };
    }

    // Sobrescribir íconos según categoría si se desea
    if (categoria === 'sueno') estilos.icon = <Moon className={estilos.icon.props.className} />;
    if (categoria === 'estres') estilos.icon = <Brain className={estilos.icon.props.className} />;
    if (categoria === 'estudio') estilos.icon = <BookOpen className={estilos.icon.props.className} />;
    if (categoria === 'actividad') estilos.icon = <HeartPulse className={estilos.icon.props.className} />;

    return estilos;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recomendaciones Inteligentes</h1>
        <p className="text-slate-500 text-sm">Análisis basado en tus registros de los últimos 7 días.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
          <p>Analizando tus patrones...</p>
        </div>
      ) : recomendaciones.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
          No hay recomendaciones disponibles en este momento.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recomendaciones.map((rec, index) => {
            const { bg, border, icon, text } = getEstilos(rec.nivel, rec.categoria);
            return (
              <div key={index} className={`${bg} ${border} border p-5 rounded-xl shadow-sm flex items-start gap-4 transition-all hover:scale-[1.01]`}>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-white/50 shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className={`font-bold ${text} mb-1`}>{rec.titulo}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{rec.mensaje}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}