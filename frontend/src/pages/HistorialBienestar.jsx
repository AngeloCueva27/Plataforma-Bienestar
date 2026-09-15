import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Download, Trash2, Calendar, RefreshCw } from 'lucide-react';

export default function HistorialBienestar() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bienestar/historial');
      setHistorial(res.data || []);
    } catch (err) {
      console.error('Error al cargar historial', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // Filtrado local por rango de fechas
  const historialFiltrado = historial.filter((item) => {
    if (!item.fecha) return true;
    const fechaRegistro = item.fecha.split('T')[0];
    if (fechaInicio && fechaRegistro < fechaInicio) return false;
    if (fechaFin && fechaRegistro > fechaFin) return false;
    return true;
  });

  // Exportar el historial filtrado a formato CSV
  const exportarCSV = () => {
    if (historialFiltrado.length === 0) return;

    const encabezados = ['ID', 'Fecha', 'Horas Sueño', 'Nivel Estrés', 'Horas Estudio', 'Actividad Física (min)', 'Notas'];
    const filas = historialFiltrado.map((item) => [
      item.id,
      item.fecha ? item.fecha.split('T')[0] : '',
      item.horas_sueno,
      item.nivel_estres,
      item.horas_estudio,
      item.actividad_fisica || 0,
      `"${(item.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_bienestar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro?')) return;
    try {
      await api.delete(`/bienestar/registro/${id}`);
      setHistorial(historial.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error al eliminar registro', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Registros</h1>
          <p className="text-slate-500 text-sm">Consulta, filtra y exporta la información registrada.</p>
        </div>
        <button
          onClick={exportarCSV}
          disabled={historialFiltrado.length === 0}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Controles de Filtro */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
            }}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Sueño</th>
                <th className="px-6 py-3">Estrés</th>
                <th className="px-6 py-3">Estudio</th>
                <th className="px-6 py-3">Ejercicio</th>
                <th className="px-6 py-3">Notas</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    Cargando historial...
                  </td>
                </tr>
              ) : historialFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No hay registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                historialFiltrado.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.fecha ? item.fecha.split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4">{item.horas_sueno} hrs</td>
                    <td className="px-6 py-4">{item.nivel_estres} / 10</td>
                    <td className="px-6 py-4">{item.horas_estudio} hrs</td>
                    <td className="px-6 py-4">{item.actividad_fisica || 0} min</td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">{item.notas || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => eliminarRegistro(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}