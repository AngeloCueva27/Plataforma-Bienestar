import { useEffect, useState } from 'react';
import { bienestarService } from '../services/bienestarService';

export function DashboardMetas() {
  const [metas, setMetas] = useState(null);

  useEffect(() => {
    bienestarService.obtenerCumplimientoMetas()
      .then(setMetas)
      .catch((err) => console.error(err));
  }, []);

  if (!metas) return <p>Cargando métricas de cumplimiento...</p>;

  return (
    <div className="p-4 border rounded">
      <h2>Progreso General: {metas.porcentaje_cumplimiento_general}%</h2>
      <ul>
        <li>Meta Sueño: {metas.meta_horas_sueno_lograda ? '✅ Lograda' : '❌ Pendiente'}</li>
        <li>Estrés Bajo Control: {metas.meta_estres_controlado ? '✅ Sí' : '⚠️ Elevado'}</li>
      </ul>
    </div>
  );
}