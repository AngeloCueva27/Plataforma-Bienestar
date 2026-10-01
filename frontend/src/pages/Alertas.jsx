import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import AlertasPreventivas from '../components/bienestar/AlertasPreventivas';

export default function Alertas() {
  const { user } = useAuth();

  // Candado de seguridad: Si NO es estudiante, lo enviamos de vuelta al inicio
  if (user?.rol !== 'estudiante' && user?.rol !== 'user') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis Alertas</h1>
            <p className="text-sm text-slate-500">Avisos preventivos sobre tus hábitos recientes</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
          Alertas Activas
        </h2>
        <AlertasPreventivas />
      </div>
    </div>
  );
}