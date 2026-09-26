import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Moon, Brain, BookOpen, Activity } from 'lucide-react';
import api from '../services/api';
import ChatbotBienestar from '../components/ChatbotBienestar';

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    promedio_sueno: 0,
    promedio_estres: 0,
    promedio_estudio: 0,
    total_registros: 0
  });
  
  // Nuevo estado exclusivo para las líneas del gráfico
  const [historialGrafico, setHistorialGrafico] = useState([]); 
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Cargamos los números para las 4 tarjetas superiores
        const resEstadisticas = await api.get('/bienestar/estadisticas');
        if (resEstadisticas.data) {
          setEstadisticas(resEstadisticas.data);
        }

        // 2. Cargamos el historial para dibujar el gráfico
        const resHistorial = await api.get('/bienestar/historial');
        if (resHistorial.data) {
          // Extraemos el arreglo directamente, o lo buscamos si viene dentro de una propiedad
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
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Cargando tu panel de bienestar...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel Principal</h1>
        <p className="text-slate-500">Resumen de tus métricas y evolución reciente.</p>
      </div>

      {/* Tarjetas de Métricas */}
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

      {/* Gráfico de Evolución Temporal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Temporal</h3>
        <div className="h-[300px] w-full">
          {historialGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* Le inyectamos historialGrafico al LineChart */}
              <LineChart data={historialGrafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                <Line type="monotone" name="Estrés (1-10)" dataKey="estres" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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

      {/* ========================================= */}
      {/* SECCIÓN DEL CHATBOT DE INTELIGENCIA ARTIFICIAL */}
      {/* ========================================= */}
      <div className="mt-8">
        <ChatbotBienestar />
      </div>

    </div>
  );
}