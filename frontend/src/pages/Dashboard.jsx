import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Moon, Brain, BookOpen, Activity, Droplet, Utensils, Target } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatbotBienestar from '../components/ChatbotBienestar';
import PatronBienestarCard from '../components/bienestar/PatronBienestarCard';
import AlertasPreventivas from '../components/bienestar/AlertasPreventivas';

export default function Dashboard() {
  const { user } = useAuth(); // 1. Extraemos el usuario autenticado
  
  const [estadisticas, setEstadisticas] = useState({
    promedio_sueno: 0,
    promedio_estres: 0,
    promedio_estudio: 0,
    total_registros: 0
  });
  
  const [historialGrafico, setHistorialGrafico] = useState([]); 
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Si no es estudiante, evitamos hacer peticiones a la API y cortamos la carga
    if (user?.rol !== 'estudiante' && user?.rol !== 'user') {
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const resEstadisticas = await api.get('/bienestar/estadisticas');
        if (resEstadisticas.data) {
          setEstadisticas(resEstadisticas.data);
        }

        const resHistorial = await api.get('/bienestar/historial');
        if (resHistorial.data) {
          const datosGrafico = Array.isArray(resHistorial.data) ? resHistorial.data : (resHistorial.data.registros || []);
          setHistorialGrafico(datosGrafico);
        }
      } catch (error) {
        console.error("Error al cargar los datos del Dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [user]);

  // 2. REDIRECCIONES DE SEGURIDAD (Siempre después de los hooks)
  if (user?.rol === 'admin' || user?.es_admin) {
    return <Navigate to="/admin/usuarios" replace />;
  }

  if (['psicologo', 'nutricionista', 'educador', 'especialista'].includes(user?.rol)) {
    return <Navigate to="/bienestar/especialistas" replace />;
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Cargando tu panel de bienestar...
      </div>
    );
  }

  // Cálculos dinámicos transdisciplinarios basados en los últimos 7 días
  const ultimos7Dias = historialGrafico.slice(0, 7);
  const calcPromedio = (campo) => {
    if (ultimos7Dias.length === 0) return 0;
    const sum = ultimos7Dias.reduce((acc, curr) => acc + (curr[campo] || 0), 0);
    return (sum / ultimos7Dias.length).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel Principal</h1>
        <p className="text-slate-500">Resumen integral transdisciplinario de tus métricas recientes.</p>
      </div>

      {/* Tarjetas de Métricas Originales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Moon className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promedio Sueño</p>
            <p className="text-2xl font-bold text-slate-800">{estadisticas.promedio_sueno} hrs</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Brain className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promedio Estrés</p>
            <p className="text-2xl font-bold text-slate-800">{estadisticas.promedio_estres} / 10</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promedio Estudio</p>
            <p className="text-2xl font-bold text-slate-800">{estadisticas.promedio_estudio} hrs</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registros Totales</p>
            <p className="text-2xl font-bold text-slate-800">{estadisticas.total_registros}</p>
          </div>
        </div>
      </div>

      {/* Fila Transdisciplinaria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Nutrición (Promedio)</p>
              <p className="text-lg font-bold text-slate-700">{calcPromedio('comidas_realizadas')} Comidas</p>
            </div>
            <Utensils className="text-green-500 w-8 h-8 opacity-50" />
         </div>
         <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Hidratación (Promedio)</p>
              <p className="text-lg font-bold text-slate-700">{calcPromedio('vasos_agua')} Vasos/día</p>
            </div>
            <Droplet className="text-blue-500 w-8 h-8 opacity-50" />
         </div>
         <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">C. de la Educación</p>
              <p className="text-lg font-bold text-slate-700">{calcPromedio('nivel_concentracion')} /10 Concentración</p>
            </div>
            <Target className="text-orange-500 w-8 h-8 opacity-50" />
         </div>
      </div>

      {/* Tarjeta de Análisis de Patrones */}
      <PatronBienestarCard registros={ultimos7Dias} />

      {/* Gráfico de Evolución Temporal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Temporal</h3>
        <div className="h-[300px] w-full">
          {historialGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historialGrafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                <Line type="monotone" name="Estrés (1-10)" dataKey="nivel_estres" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Estudio (hrs)" dataKey="horas_estudio" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Sueño (hrs)" dataKey="horas_sueno" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-slate-400 text-sm">
               Agrega un nuevo registro para ver tu evolución gráfica.
             </div>
          )}
        </div>
      </div>

      {/* CHATBOT */}
      <div className="mt-8">
        <ChatbotBienestar />
      </div>

    </div>
  );
}