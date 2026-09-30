import { useState, useEffect } from 'react';
import { Users, Shield, User, Activity, MoreVertical, Plus, X, Loader2, Stethoscope, Apple, BookOpen } from 'lucide-react';
import axios from 'axios';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal de Crear Usuario
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    ciclo: 1,
    rol: 'estudiante'
  });

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/auth/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
      setError('Error al cargar la lista de usuarios. Verifica la conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      // Usamos el endpoint de registro
      await axios.post('http://localhost:8000/auth/register', {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        ciclo: parseInt(formData.ciclo) || 1, // Asegura que sea un número válido
        rol: formData.rol
      });
      
      // Si tiene éxito, cerramos el modal, limpiamos el formulario y recargamos la tabla
      setShowModal(false);
      setFormData({ nombre: '', email: '', password: '', ciclo: 1, rol: 'estudiante' });
      fetchUsuarios();
      
    } catch (err) {
      // Manejo seguro de errores para evitar que React falle (Pantalla en blanco) al recibir Arrays u Objetos
      let errorMsg = 'Error al crear el usuario. Revisa los datos.';
      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        // Si el backend envía un mensaje de texto simple (Ej. "El correo ya existe")
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        // Si FastAPI envía un error de validación 422 Unprocessable Entity
        errorMsg = detail[0].msg;
      }

      setModalError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para renderizar la etiqueta del rol con su icono y color correcto
  const renderRolBadge = (user) => {
    if (user.es_admin || user.rol === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }

    switch(user.rol) {
      case 'psicologo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
            <Stethoscope className="w-3 h-3" /> Psicólogo
          </span>
        );
      case 'nutricionista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <Apple className="w-3 h-3" /> Nutricionista
          </span>
        );
      case 'educador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <BookOpen className="w-3 h-3" /> Educador
          </span>
        );
      default: // estudiante
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <User className="w-3 h-3" /> Estudiante
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Cargando usuarios...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
            <p className="text-sm text-slate-500">Administra los accesos y roles de la plataforma</p>
          </div>
        </div>
        
        {/* Botón Nuevo Usuario */}
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Correo Electrónico</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 text-sm">#{user.id}</td>
                  <td className="p-4 font-medium text-slate-800">{user.email}</td>
                  <td className="p-4">
                    {renderRolBadge(user)}
                  </td>
                  <td className="p-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <Activity className="w-4 h-4" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                        <Activity className="w-4 h-4" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {usuarios.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Ventana Emergente para Crear Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Registrar Nuevo Usuario</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="usuario@unheval.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Temporal</label>
                <input 
                  type="password" required minLength="6"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo (Solo estudiantes)</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={formData.ciclo}
                    onChange={(e) => setFormData({...formData, ciclo: e.target.value})}
                    disabled={formData.rol !== 'estudiante'} // Se desactiva si es especialista
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select 
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="psicologo">Psicólogo</option>
                    <option value="nutricionista">Nutricionista</option>
                    <option value="educador">Educador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}