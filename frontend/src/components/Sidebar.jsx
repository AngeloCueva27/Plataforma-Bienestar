import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, Lightbulb, Target, 
  Users, User, HeartPulse, ShieldCheck, GraduationCap, KeyRound,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  // Extraemos el rol. Si no hay, asumimos estudiante
  const userRole = user?.rol || 'estudiante';

  // Usamos un arreglo (Array) en "roles" para permitir que múltiples tipos de especialistas vean su panel
  const navItems = [
    // --- RUTAS DE ESTUDIANTE ---
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['estudiante'] },
    { path: '/bienestar/registrar', label: 'Nuevo Registro', icon: PlusCircle, roles: ['estudiante'] },
    { path: '/bienestar/historial', label: 'Historial', icon: History, roles: ['estudiante'] },
    { path: '/bienestar/recomendaciones', label: 'Recomendaciones', icon: Lightbulb, roles: ['estudiante'] },
    { path: '/bienestar/metas', label: 'Metas', icon: Target, roles: ['estudiante'] },
    { path: '/perfil', label: 'Mi Perfil', icon: User, roles: ['estudiante', 'psicologo', 'nutricionista', 'educador', 'especialista'] },
    
    // --- RUTAS DE ESPECIALISTAS (Oculto para estudiantes) ---
    { 
      path: '/bienestar/especialistas', 
      label: 'Panel Especialista', 
      icon: ClipboardCheck, 
      roles: ['especialista', 'psicologo', 'nutricionista', 'educador'] 
    },

    // --- RUTAS DE ADMINISTRADOR Y ESPECIALISTAS ---
    { path: '/admin/usuarios', label: 'Gestión de Usuarios', icon: Users, roles: ['admin'] },
    { 
      path: '/admin/estudiantes', 
      label: 'Perfiles Estudiantiles', 
      icon: GraduationCap, 
      // 👇 AQUÍ ESTÁ EL CAMBIO: Se agregaron los roles de los especialistas
      roles: ['admin', 'psicologo', 'nutricionista', 'educador', 'especialista'] 
    },
    { path: '/admin/auditoria', label: 'Auditoría', icon: ShieldCheck, roles: ['admin'] },
    { path: '/admin/restablecer', label: 'Restablecer Contraseñas', icon: KeyRound, roles: ['admin'] },
  ];

  // Filtramos: Solo mostramos los items donde el arreglo 'roles' incluya el rol del usuario actual
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

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