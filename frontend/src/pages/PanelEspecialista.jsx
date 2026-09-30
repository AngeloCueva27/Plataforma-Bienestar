import { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, XCircle, UserX } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PanelEspecialista() {
  const { user } = useAuth(); // Obtenemos el usuario y su rol actual
  const [casos, setCasos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    // Evitamos hacer la petición si es un estudiante
    if (user?.rol !== 'estudiante') {
      cargarCasos();
    }
  }, [user]);

  // BLOQUEO DE SEGURIDAD: Si es estudiante, lo pateamos al Dashboard
  if (user?.rol === 'estudiante') {
    return <Navigate to="/" replace />;
  }

  const cargarCasos = async () => {
    try {
      setCargando(true);
      const res = await api.get('/api/especialista/validaciones/casos-pendientes');
      
      // FILTRO INTELIGENTE POR ESPECIALIDAD
      let casosFiltrados = res.data;
      
      if (user?.rol === 'psicologo') {
        casosFiltrados = res.data.filter(c => c.disciplinas?.includes('Psicología'));
      } else if (user?.rol === 'nutricionista') {
        casosFiltrados = res.data.filter(c => c.disciplinas?.includes('Nutrición'));
      } else if (user?.rol === 'educador') {
        casosFiltrados = res.data.filter(c => c.disciplinas?.includes('Ciencias de la Educación'));
      }
      // Si el rol es 'admin' o un 'especialista' general, verá todos los casos

      setCasos(casosFiltrados);
    } catch (error) {
      console.error("Error al cargar casos:", error);
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los casos pendientes.' });
    } finally {
      setCargando(false);
    }
  };

  const handleObservacionChange = (id, value) => {
    setObservaciones(prev => ({ ...prev, [id]: value }));
  };

  const enviarValidacion = async (caso, estado) => {
    try {
      const payload = {
        recomendacion_id: caso.tipo === 'Recomendación IA' ? caso.id_referencia : null,
        alerta_id: caso.tipo === 'Alerta' ? caso.id_referencia : null,
        estado: estado,
        observacion: observaciones[caso.id_referencia] || ''
      };

      await api.post('/api/especialista/validaciones/', payload);
      
      setCasos(casos.filter(c => c.id_referencia !== caso.id_referencia));
      setMensaje({ tipo: 'exito', texto: 'Validación registrada correctamente.' });
      
      setObservaciones(prev => {
        const newObs = { ...prev };
        delete newObs[caso.id_referencia];
        return newObs;
      });

      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error("Error enviando validación:", error);
      setMensaje({ tipo: 'error', texto: 'Error al registrar la validación.' });
    }
  };

  if (cargando) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium">Cargando panel seguro...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* Encabezado Administrativo */}
      <div className="bg-slate-800 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-md gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            Panel de Validación ({user?.rol ? user.rol.toUpperCase() : 'ESPECIALISTA'})
          </h1>
          <p className="text-slate-300 mt-1 text-sm">Supervisión de orientaciones generadas por IA filtradas por tu área.</p>
        </div>
        <div className="bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-600 flex items-center gap-2">
          <UserX className="w-4 h-4 text-slate-400" />
          Identidad Estudiantil Protegida
        </div>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2 font-medium ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {mensaje.tipo === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {mensaje.texto}
        </div>
      )}

      {/* Lista de Casos Anónimos */}
      {casos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Bandeja limpia</h3>
          <p className="text-slate-500">No hay orientaciones de tu especialidad pendientes de validación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {casos.map(caso => (
            <div key={caso.id_referencia} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
              
              {/* Información del Caso Generado por la IA */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-mono text-sm font-bold border border-slate-200">
                    {caso.codigo_anonimo || 'ANON-000'}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                    {caso.categoria || caso.tipo}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
                  <p className="font-semibold text-slate-500 text-xs mb-2 uppercase tracking-wider">Consejo emitido por IA:</p>
                  "{caso.contenido_ia || caso.descripcion}"
                </div>

                <div className="flex flex-wrap gap-2">
                  {caso.disciplinas?.map((disc, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded uppercase">
                      {disc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controles de Supervisión Humana */}
              <div className="w-full md:w-72 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <textarea 
                  placeholder="Añadir observaciones médicas o académicas (opcional)..." 
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 h-24 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none bg-slate-50"
                  value={observaciones[caso.id_referencia] || ''}
                  onChange={(e) => handleObservacionChange(caso.id_referencia, e.target.value)}
                ></textarea>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => enviarValidacion(caso, 'aprobada')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl flex justify-center items-center gap-1 transition-colors text-sm shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprobar
                  </button>
                  <button 
                    onClick={() => enviarValidacion(caso, 'correccion_solicitada')}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-xl flex justify-center items-center gap-1 border border-red-200 transition-colors text-sm shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Objetar
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}