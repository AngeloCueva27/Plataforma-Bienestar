import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Shield, UserCheck, UserX, Search, AlertCircle } from 'lucide-react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios o no cuentas con permisos de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((user) =>
    user.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm">Administra las cuentas y permisos registrados en la plataforma.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar usuario por email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-sm rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Cargando usuarios...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No se encontraron usuarios registrados.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Correo Electrónico</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">#{u.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.es_admin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Shield className="w-3.5 h-3.5" />
                        {u.es_admin ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.is_active !== false ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Activo
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Inactivo
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}