import { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AdminRestablecer() {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // Cargar los usuarios al abrir la pantalla
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/auth/usuarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(response.data);
      } catch (err) {
        setMessage('Error al cargar la lista de usuarios. Verifica tu conexión.');
        setIsError(true);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones básicas
    if (!selectedUserId) {
      setMessage('Por favor selecciona un usuario.');
      setIsError(true); return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setIsError(true); return;
    }
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      setIsError(true); return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put('http://localhost:8000/auth/reset-password', 
        {
          user_id: parseInt(selectedUserId),
          new_password: newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Éxito
      setMessage(response.data.message || 'Contraseña actualizada correctamente.');
      setIsError(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId(''); // Limpiar el formulario
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error al cambiar la contraseña. Verifica los permisos.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Restablecer Contraseñas</h1>
          <p className="text-sm text-slate-500">Asigna una nueva contraseña a cualquier usuario del sistema</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Mensajes de Alerta */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {isError ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {message}
          </div>
        )}

        {/* Selección de Usuario */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Usuario</label>
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loadingUsers}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-50 text-slate-700"
          >
            <option value="">{loadingUsers ? 'Cargando usuarios...' : '-- Seleccione un correo --'}</option>
            {usuarios.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} {user.es_admin ? '(Admin)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Nueva Contraseña */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nueva Contraseña</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Escribe la nueva contraseña"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-700 pr-12"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Contraseña</label>
          <input 
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-700"
          />
        </div>

        {/* Botón Guardar */}
        <button 
          type="submit" 
          disabled={isSubmitting || loadingUsers}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold p-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Actualizando...</>
          ) : (
            <><KeyRound className="w-5 h-5" /> Cambiar Contraseña</>
          )}
        </button>
      </form>
    </div>
  );
}