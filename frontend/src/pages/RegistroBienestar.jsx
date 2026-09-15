import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bienestarService } from '../services/bienestarService';
import { Heart, Moon, Brain, BookOpen, Activity, Save } from 'lucide-react';

export default function RegistroBienestar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formData, setFormData] = useState({
    horas_sueno: 7,
    nivel_estres: 5,
    nivel_animo: 5,
    horas_estudio: 4,
    actividad_fisica: 30,
    actividad_fisica_tipo: '',
    emociones: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Mapeo adaptado al esquema de PostgreSQL/FastAPI
      const payload = {
        horas_sueno: Number(formData.horas_sueno),
        nivel_estres: Number(formData.nivel_estres),
        nivel_animo: Number(formData.nivel_animo),
        horas_estudio: Number(formData.horas_estudio),
        // Convierte los minutos a Booleano para evitar DatatypeMismatch
        actividad_fisica: Number(formData.actividad_fisica) > 0,
        tipo_actividad: formData.actividad_fisica_tipo,
        notas: formData.emociones,
      };

      await bienestarService.registrarDia(payload);

      setMensaje({ tipo: 'exito', texto: '¡Registro guardado correctamente!' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.detail || 'Error al guardar el registro',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo Registro de Bienestar</h1>
        <p className="text-slate-500 text-sm">Ingresa tus métricas del día para actualizar tus indicadores.</p>
      </div>

      {mensaje.texto && (
        <div
          className={`p-4 rounded-lg font-medium text-sm ${
            mensaje.tipo === 'exito'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sueño */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Horas de Sueño (0 - 24)
            </label>
            <input
              type="number"
              name="horas_sueno"
              min="0"
              max="24"
              step="0.5"
              required
              value={formData.horas_sueno}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Estrés */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Brain className="w-4 h-4 text-amber-500" /> Nivel de Estrés (1 - 10)
            </label>
            <input
              type="number"
              name="nivel_estres"
              min="1"
              max="10"
              required
              value={formData.nivel_estres}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Ánimo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Heart className="w-4 h-4 text-rose-500" /> Nivel de Ánimo (1 - 10)
            </label>
            <input
              type="number"
              name="nivel_animo"
              min="1"
              max="10"
              required
              value={formData.nivel_animo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Estudio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Horas de Estudio (0 - 24)
            </label>
            <input
              type="number"
              name="horas_estudio"
              min="0"
              max="24"
              step="0.5"
              required
              value={formData.horas_estudio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Actividad Física */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Activity className="w-4 h-4 text-sky-500" /> Actividad Física (minutos)
            </label>
            <input
              type="number"
              name="actividad_fisica"
              min="0"
              value={formData.actividad_fisica}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Tipo de Actividad */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Actividad</label>
            <input
              type="text"
              name="actividad_fisica_tipo"
              placeholder="Ej. Caminata, Gimnasio, Yoga"
              value={formData.actividad_fisica_tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Emociones y Notas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Notas / Emociones</label>
          <textarea
            name="emociones"
            rows={3}
            placeholder="¿Cómo te sentiste hoy?"
            value={formData.emociones}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </form>
    </div>
  );
}