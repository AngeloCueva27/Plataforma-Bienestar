  import { useEffect, useState } from 'react';
  import api from '../services/api';
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
  import { Moon, Brain, BookOpen, Activity } from 'lucide-react';

  export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [resStats, resHistorial] = await Promise.all([
            api.get('/bienestar/estadisticas'),
            api.get('/bienestar/historial')
          ]);
          setStats(resStats.data);
          
          // Formatear la fecha para limpiar el eje X del gráfico
          const datosOrdenados = [...(resHistorial.data || [])]
            .reverse()
            .map((item) => ({
              ...item,
              fechaFormateada: item.fecha ? item.fecha.split('T')[0] : ''
            }));
          setHistorial(datosOrdenados);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    if (loading) {
      return <div className="p-8 text-center text-slate-500 font-medium">Cargando métricas del panel...</div>;
    }

    // Compatibilidad con las distintas claves que puede retornar la API
    const promedioSueno = stats?.promedio_sueno ?? stats?.promedio_horas_sueno ?? stats?.avg_sueno ?? 0;
    const promedioEstres = stats?.promedio_estres ?? stats?.promedio_nivel_estres ?? stats?.avg_estres ?? 0;
    const promedioEstudio = stats?.promedio_estudio ?? stats?.promedio_horas_estudio ?? stats?.avg_estudio ?? 0;
    const totalRegistros = stats?.total_registros ?? stats?.total ?? 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel Principal</h1>
          <p className="text-slate-500 text-sm">Resumen de tus métricas y evolución reciente.</p>
        </div>

        {/* Tarjetas Informativas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Promedio Sueño</p>
              <p className="text-xl font-bold text-slate-800">{promedioSueno} hrs</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Promedio Estrés</p>
              <p className="text-xl font-bold text-slate-800">{promedioEstres} / 10</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Promedio Estudio</p>
              <p className="text-xl font-bold text-slate-800">{promedioEstudio} hrs</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Registros Totales</p>
              <p className="text-xl font-bold text-slate-800">{totalRegistros}</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolución */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Evolución Temporal</h2>
          {historial.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">Ingresa nuevos registros para visualizarlos en el gráfico.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historial}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fechaFormateada" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="horas_sueno" name="Sueño (hrs)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="nivel_estres" name="Estrés (1-10)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="horas_estudio" name="Estudio (hrs)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  }