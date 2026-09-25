import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  // Extraemos el nombre y correo del token. 
  // Nota: JWT guarda el correo en la propiedad 'sub' por defecto.
  const nombreUsuario = user?.nombre || 'Usuario';
  const correoUsuario = user?.sub || user?.email || 'Cargando...';

  // Obtenemos la primera letra para el Avatar circular
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      
      {/* Saludo dinámico */}
      <div className="flex items-center gap-4">
        <span className="text-slate-600 font-medium">
          Bienvenido, <span className="font-bold text-slate-800 text-lg">{nombreUsuario}</span>
        </span>
      </div>
      
      {/* Perfil y Botón de Salida */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{nombreUsuario}</p>
            <p className="text-xs text-slate-500">{correoUsuario}</p>
          </div>
          {/* Avatar dinámico */}
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-lg">
            {inicial}
          </div>
        </div>
        
        {/* Separador */}
        <div className="w-px h-8 bg-slate-200"></div>

        <button 
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}