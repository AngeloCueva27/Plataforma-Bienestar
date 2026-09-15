import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Lightbulb, Target, Users, User, HeartPulse } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/bienestar/registrar', label: 'Nuevo Registro', icon: PlusCircle },
    { path: '/bienestar/historial', label: 'Historial', icon: History },
    { path: '/bienestar/recomendaciones', label: 'Recomendaciones', icon: Lightbulb },
    { path: '/bienestar/metas', label: 'Metas', icon: Target },
    { path: '/perfil', label: 'Mi Perfil', icon: User },
    { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-sky-500 text-white rounded-lg">
          <HeartPulse className="w-6 h-6" />
        </div>
        <span className="font-bold text-white text-lg tracking-wide">BienestarApp</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
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