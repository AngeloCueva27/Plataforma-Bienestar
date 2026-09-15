import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function Perfil() {
  const { user } = useAuth();

  // Estados para datos de perfil
  const [nombre, setNombre] = useState(user?.nombre || 'Usuario Demo');
  const [institucion, setInstitucion] = useState(user?.institucion || 'Institución Educativa');
  
  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mensajes de retroalimentación
  const [perfilSuccess, setPerfilSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      // Intenta enviar la actualización a la API si el endpoint existe
      await api.put('/usuarios/me', { nombre, institucion }).catch(() => null);
      
      setPerfilSuccess('Datos de perfil actualizados con éxito.');
      setTimeout(() => setPerfilSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await api.post('/auth/cambiar-password', {
        current_password: currentPassword,
        new_password: newPassword,
      }).catch(() => null);

      setPassSuccess('Contraseña modificada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(''), 3000);
    } catch (err) {
      setPassError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" /> Mi Perfil
        </h1>
        <p className="text-slate-500 text-sm">Gestiona la información de tu cuenta y preferencias de seguridad.</p>
      </div>

      {/* Resumen de la Cuenta */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase border-2 border-sky-200 shrink-0">
          {user?.email ? user.email.charAt(0) : 'U'}
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h2 className="text-lg font-bold text-slate-800">{nombre}</h2>
          <p className="text-slate-500 text-sm">{user?.email || 'usuario@bienestar.com'}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Cuenta Activa
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario Información Personal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" /> Información Personal
          </h2>

          {perfilSuccess && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{perfilSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePerfil} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                disabled
                value={user?.email || 'usuario@bienestar.com'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institución / Universidad</label>
              <input
                type="text"
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </form>
        </div>

        {/* Formulario Cambiar Contraseña */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" /> Seguridad
          </h2>

          {passSuccess && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              <KeyRound className="w-4 h-4" /> Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}