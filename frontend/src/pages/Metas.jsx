import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Target, Moon, Brain, BookOpen, CheckCircle2, Save } from 'lucide-react';

export default function Metas() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);

  // Carga o inicializa las metas del usuario
  const [metas, setMetas] = useState(() => {
    const metasGuardadas = localStorage.getItem('metas_bienestar');
    return metasGuardadas
      ? JSON.parse(metasGuardadas)
      : { metaSueno: 8, metaEstres: 4, metaEstudio: 5 };
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/bienestar/estadisticas');
        setStats(res.data);
      } catch (err) {
        console.error('Error al obtener estadísticas para metas', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleGuardar = (e) => {
    e.preventDefault();
    localStorage.setItem('metas_bienestar', JSON.stringify(metas));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const promedioSueno = stats?.promedio_sueno ?? stats?.promedio_horas_sueno ?? 0;
  const promedioEstres = stats?.promedio_estres ?? stats?.promedio_nivel_estres ?? 0;
  const promedioEstudio = stats?.promedio_estudio ?? stats?.promedio_horas_estudio ?? 0;

  // Cálculo de porcentajes de cumplimiento
  const porcentajeSueno = Math.min(100, Math.round((promedioSueno / (metas.metaSueno || 1)) * 100));
  const porcentajeEstres = Math.min(100, Math.round((1 - promedioEstres / 10) * 100)); // Menor estrés es mejor
  const porcentajeEstudio = Math.min(100, Math.round((promedioEstudio / (metas.metaEstudio || 1)) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" /> Metas y Objetivos
        </h1>
        <p className="text-slate-500 text-sm">Ajusta tus metas personales y monitorea tu tasa de cumplimiento habitual.</p>
      </div>

      {guardado && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>¡Metas actualizadas exitosamente!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Configuración de Metas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Configurar Objetivos</h2>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Meta de Sueño (hrs/día)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="14"
                value={metas.metaSueno}
                onChange={(e) => setMetas({ ...metas, metaSueno: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tope Máximo Estrés (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={metas.metaEstres}
                onChange={(e) => setMetas({ ...metas, metaEstres: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Meta de Estudio (hrs/día)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={metas.metaEstudio}
                onChange={(e) => setMetas({ ...metas, metaEstudio: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              <Save className="w-4 h-4" /> Guardar Metas
            </button>
          </form>
        </div>

        {/* Progreso del Cumplimiento */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Progreso de Cumplimiento</h2>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Calculando indicadores...</div>
          ) : (
            <div className="space-y-6">
              {/* Barra Sueño */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" /> Sueño habitual: {promedioSueno} / {metas.metaSueno} hrs
                  </span>
                  <span className="font-bold text-indigo-600">{porcentajeSueno}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeSueno}%` }}
                  />
                </div>
              </div>

              {/* Barra Estrés */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-600" /> Control Estrés: promedio {promedioEstres} (Tope: {metas.metaEstres})
                  </span>
                  <span className="font-bold text-amber-600">{porcentajeEstres}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      promedioEstres <= metas.metaEstres ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${porcentajeEstres}%` }}
                  />
                </div>
              </div>

              {/* Barra Estudio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> Tiempo Estudio: {promedioEstudio} / {metas.metaEstudio} hrs
                  </span>
                  <span className="font-bold text-emerald-600">{porcentajeEstudio}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeEstudio}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}