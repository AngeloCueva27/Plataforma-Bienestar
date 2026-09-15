import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
      <p className="text-sm text-slate-600 font-medium">
        Bienvenido, <span className="font-semibold text-slate-800">{user?.email || 'Usuario'}</span>
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition"
          title="Ver Perfil"
        >
          <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
            {user?.email ? user.email.charAt(0) : 'U'}
          </div>
          <span>Mi Perfil</span>
        </button>

        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}