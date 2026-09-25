import { useState, useEffect } from 'react';
import { User, KeyRound, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const { user } = useAuth();
  
  // Extraemos los datos reales del token
  const correoUsuario = user?.sub || user?.email || '';
  const nombreUsuario = user?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  // Estados del formulario pre-llenados con los datos reales
  const [email, setEmail] = useState(correoUsuario);
  const [nombre, setNombre] = useState(nombreUsuario);
  const [institucion, setInstitucion] = useState('UNHEVAL'); // Puedes cambiarlo si gustas

  // Si el usuario cambia (ej. al recargar), actualizamos los estados
  useEffect(() => {
    if (user) {
      setEmail(user.sub || user.email || '');
      setNombre(user.nombre || 'Usuario');
    }
  }, [user]);

  const handleGuardarPerfil = (e) => {
    e.preventDefault();
    alert("Próximamente: Conexión con el backend para actualizar perfil");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Cabecera del Perfil */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" /> Mi Perfil
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona la información de tu cuenta y preferencias de seguridad.
        </p>
      </div>

      {/* Tarjeta Superior: Resumen */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-3xl">
          {inicial}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{nombreUsuario}</h2>
          <p className="text-slate-500">{correoUsuario}</p>
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Cuenta Activa
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario: Información Personal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800">Información Personal</h3>
          </div>
          
          <form onSubmit={handleGuardarPerfil} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled // El correo normalmente no se edita directamente
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Institución / Universidad</label>
              <input 
                type="text" 
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <button type="submit" className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </form>
        </div>

        {/* Formulario: Seguridad */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800">Seguridad</h3>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contraseña Actual</label>
              <input 
                type="password" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <button type="button" className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <KeyRound className="w-4 h-4" /> Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}