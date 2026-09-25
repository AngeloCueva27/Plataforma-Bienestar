import { useState, useEffect } from 'react';
import { GraduationCap, Search, FileText, Activity } from 'lucide-react';
import axios from 'axios';

export default function AdminEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/auth/usuarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // El filtro mágico: Nos quedamos SOLO con los que NO son administradores
        const soloEstudiantes = response.data.filter(u => !u.es_admin);
        setEstudiantes(soloEstudiantes);
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantes();
  }, []);

  // Filtro de búsqueda en tiempo real
  const estudiantesFiltrados = estudiantes.filter(est => 
    est.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Perfiles Estudiantiles</h1>
            <p className="text-sm text-slate-500">Consulta los expedientes y progreso de los alumnos</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Grid de Tarjetas de Estudiantes */}
      {loading ? (
        <div className="text-slate-500 p-6 flex justify-center">Cargando expedientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estudiantesFiltrados.map((est) => (
            <div key={est.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar generado con la primera letra del correo */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg uppercase">
                      {est.email.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 truncate max-w-[150px]" title={est.email}>
                        {est.email.split('@')[0]}
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{est.email}</p>
                    </div>
                  </div>
                  {est.is_active && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <Activity className="w-3 h-3" /> Activo
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-4">
                <button 
                  onClick={() => alert(`Próximamente: Historial clínico/bienestar de ${est.email}`)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" /> Ver Expediente
                </button>
              </div>

            </div>
          ))}

          {/* Mensaje si la búsqueda no encuentra a nadie */}
          {estudiantesFiltrados.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No se encontraron alumnos con ese criterio de búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}