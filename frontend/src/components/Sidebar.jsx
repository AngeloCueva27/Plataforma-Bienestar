import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, Lightbulb, Target, 
  Users, User, HeartPulse, ShieldCheck, GraduationCap, KeyRound,
  ClipboardCheck // <-- Importamos el nuevo ícono
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  // Extraemos el rol. Si no hay, asumimos estudiante
  const userRole = user?.rol || 'estudiante';

  // Definimos a qué rol le pertenece cada ruta usando la propiedad "role"
  const navItems = [
    // --- RUTAS DE ESTUDIANTE ---
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, role: 'estudiante' },
    { path: '/bienestar/registrar', label: 'Nuevo Registro', icon: PlusCircle, role: 'estudiante' },
    { path: '/bienestar/historial', label: 'Historial', icon: History, role: 'estudiante' },
    { path: '/bienestar/recomendaciones', label: 'Recomendaciones', icon: Lightbulb, role: 'estudiante' },
    { path: '/bienestar/metas', label: 'Metas', icon: Target, role: 'estudiante' },
    { path: '/perfil', label: 'Mi Perfil', icon: User, role: 'estudiante' },
    
    // --- RUTAS DE ESPECIALISTA (Visible temporalmente para el estudiante para poder probarlo) ---
    { path: '/bienestar/especialistas', label: 'Panel Especialista', icon: ClipboardCheck, role: 'estudiante' },

    // --- RUTAS DE ADMINISTRADOR ---
    { path: '/admin/usuarios', label: 'Gestión de Usuarios', icon: Users, role: 'admin' },
    { path: '/admin/estudiantes', label: 'Perfiles Estudiantiles', icon: GraduationCap, role: 'admin' },
    { path: '/admin/auditoria', label: 'Auditoría', icon: ShieldCheck, role: 'admin' },
    { path: '/admin/restablecer', label: 'Restablecer Contraseñas', icon: KeyRound, role: 'admin' },
  ];

  // El filtro mágico: Solo dejamos pasar los items que coincidan con el rol del usuario actual
  const filteredNavItems = navItems.filter((item) => item.role === userRole);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-sky-500 text-white rounded-lg">
          <HeartPulse className="w-6 h-6" />
        </div>
        <span className="font-bold text-white text-lg tracking-wide">
          {userRole === 'admin' ? 'AdminPanel' : 'BienestarApp'}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}