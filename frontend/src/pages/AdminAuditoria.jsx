import { useState } from 'react';
import { 
  ShieldCheck, Clock, Key, UserPlus, 
  AlertCircle, Activity, Filter 
} from 'lucide-react';

export default function AdminAuditoria() {
  const [filtro, setFiltro] = useState('todos');

  // Datos simulados para visualizar el diseño. 
  // Más adelante, esto vendrá de un endpoint como axios.get('/auth/logs')
  const [logs] = useState([
    { 
      id: 1, 
      accion: 'Cambio de contraseña', 
      descripcion: 'El administrador cambió la contraseña del usuario angelo@gmail.com',
      usuario: 'u@unheval.com', 
      fecha: 'Hace 5 minutos', 
      tipo: 'warning', 
      icono: Key 
    },
    { 
      id: 2, 
      accion: 'Inicio de sesión exitoso', 
      descripcion: 'Acceso al panel de administración',
      usuario: 'u@unheval.com', 
      fecha: 'Hace 15 minutos', 
      tipo: 'success', 
      icono: ShieldCheck 
    },
    { 
      id: 3, 
      accion: 'Nuevo registro', 
      descripcion: 'El estudiante completó su registro en el sistema',
      usuario: 'nuevo_estudiante@unheval.com', 
      fecha: 'Hace 2 horas', 
      tipo: 'info', 
      icono: UserPlus 
    },
    { 
      id: 4, 
      accion: 'Intento de acceso denegado', 
      descripcion: 'Intento de acceso a ruta protegida /admin/usuarios sin permisos',
      usuario: 'usuario_sospechoso@email.com', 
      fecha: 'Ayer', 
      tipo: 'danger', 
      icono: AlertCircle 
    },
    { 
      id: 5, 
      accion: 'Actualización de Perfil', 
      descripcion: 'El usuario actualizó sus metas y preferencias',
      usuario: 'angelo@gmail.com', 
      fecha: 'Ayer', 
      tipo: 'info', 
      icono: Activity 
    },
  ]);

  // Colores dinámicos según el nivel de alerta del evento
  const coloresTipo = {
    info: 'bg-blue-100 text-blue-600 border-blue-200',
    success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-100 text-amber-600 border-amber-200',
    danger: 'bg-red-100 text-red-600 border-red-200'
  };

  const logsFiltrados = logs.filter(log => {
    if (filtro === 'todos') return true;
    return log.tipo === filtro;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Auditoría del Sistema</h1>
            <p className="text-sm text-slate-500">Monitorea la actividad y seguridad de la plataforma</p>
          </div>
        </div>

        {/* Botones de Filtro */}
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 py-1.5 px-2 outline-none cursor-pointer"
          >
            <option value="todos">Todos los eventos</option>
            <option value="success">Accesos (Éxito)</option>
            <option value="danger">Alertas (Peligro)</option>
            <option value="warning">Modificaciones</option>
          </select>
        </div>
      </div>

      {/* Línea de Tiempo (Timeline) de Auditoría */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-8 pb-4">
          
          {logsFiltrados.map((log) => {
            const Icono = log.icono;
            return (
              <div key={log.id} className="relative pl-8 md:pl-10">
                {/* Círculo con Ícono */}
                <div className={`absolute -left-[17px] top-1 rounded-full p-1.5 border-2 bg-white ${coloresTipo[log.tipo]}`}>
                  <Icono className="w-4 h-4" />
                </div>

                {/* Contenido del Evento */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800">{log.accion}</h3>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 w-fit">
                      <Clock className="w-3 h-3" />
                      {log.fecha}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{log.descripcion}</p>
                  <div className="text-xs font-medium text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-md inline-block">
                    Usuario implicado: <span className="text-slate-700">{log.usuario}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {logsFiltrados.length === 0 && (
            <div className="pl-8 text-slate-500 py-4">
              No hay eventos que coincidan con este filtro.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}