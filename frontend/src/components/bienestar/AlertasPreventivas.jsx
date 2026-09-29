import { useState, useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import api from '../../services/api';

export default function AlertasPreventivas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    // Si la bloqueamos permanentemente, ni siquiera consultamos al servidor
    if (localStorage.getItem('alerta_bloqueada_permanente')) return;
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      api.post('/api/ia/alertas/evaluar').catch(() => {});
      const res = await api.get('/api/ia/alertas/');
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAlertas([res.data[0]]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const destruir = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Destruimos el contenedor HTML de forma invisible y silenciosa
    const contenedor = document.getElementById('contenedor-alerta-global');
    if (contenedor) {
      contenedor.remove();
    }

    // 2. Bloqueo permanente en la memoria del navegador
    localStorage.setItem('alerta_bloqueada_permanente', 'true');

    // 3. Intento de borrado en base de datos en segundo plano
    if (id) {
      api.delete(`/api/ia/alertas/${id}`).catch(() => {});
    }
  };

  if (alertas.length === 0) return null;
  const alerta = alertas[0];

  return (
    <div id="contenedor-alerta-global" className="relative p-5 rounded-2xl border flex gap-4 items-start shadow-sm bg-red-50 border-red-200 text-red-900 mb-8">
      
      <div className="p-2.5 rounded-full bg-red-100 text-red-600 mt-1">
        <AlertTriangle className="w-6 h-6" />
      </div>
      
      <div className="flex-1 pr-16">
        <h4 className="font-bold text-lg leading-none mb-2">{alerta.titulo || "Alerta Detectada"}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{alerta.descripcion}</p>
        
        <div className="mt-4 flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white/40">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium">{alerta.recomendacion}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {alerta.disciplinas?.map((disc, idx) => (
            <span key={idx} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-red-100/50 border-red-200 text-red-700">
              {disc}
            </span>
          ))}
        </div>
      </div>

      <button 
        onClick={(e) => destruir(e, alerta.id || alerta.alerta_id)}
        style={{ zIndex: 99999 }}
        className="absolute top-4 right-4 p-2 bg-red-200 hover:bg-red-500 text-red-800 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm border border-red-300"
        title="Descartar permanentemente"
      >
        <X className="w-5 h-5 stroke-[3px]" />
      </button>
      
    </div>
  );
}