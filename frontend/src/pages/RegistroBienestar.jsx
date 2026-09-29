import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, BookOpen, Send, AlertCircle, HeartPulse, Droplet, Utensils } from 'lucide-react';
import api from '../api/axios'; // o '../services/api' según tu estructura

export default function RegistroBienestar() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    horasSueno: '', comidasRealizadas: 3, vasosAgua: 0, actividadFisica: 'Ninguna', minutosActividadFisica: 0, nivelEnergia: 5,
    estadoAnimo: 'Bien', nivelAnimo: 5, nivelEstres: 5, emocionesPredominantes: '', notas: '',
    horasEstudio: '', nivelConcentracion: 5, rendimientoPercibido: 5, pausasEstudio: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.horasSueno < 0 || formData.horasEstudio < 0) return setError('Las horas no pueden ser números negativos.');
    if (formData.notas.length > 300) return setError('El comentario no puede exceder los 300 caracteres.');

    try {
      setLoading(true);
      const payload = {
        ...formData,
        horasSueno: parseFloat(formData.horasSueno) || 0,
        horasEstudio: parseFloat(formData.horasEstudio) || 0,
        comidasRealizadas: parseInt(formData.comidasRealizadas),
        vasosAgua: parseInt(formData.vasosAgua),
        minutosActividadFisica: parseInt(formData.minutosActividadFisica),
        nivelEnergia: parseInt(formData.nivelEnergia),
        nivelAnimo: parseInt(formData.nivelAnimo),
        nivelEstres: parseInt(formData.nivelEstres),
        nivelConcentracion: parseInt(formData.nivelConcentracion),
        rendimientoPercibido: parseInt(formData.rendimientoPercibido)
      };

      await api.post('/bienestar/registrar', payload);
      navigate('/bienestar/dashboard');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || 'Error al guardar el registro. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Clases reutilizables para inputs elegantes
  const inputClases = "w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-sm";
  const labelClases = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
  const sliderClases = "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Encabezado Elegante */}
      <div className="text-center space-y-2 mt-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tu Bienestar Diario</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Tómate un momento para reflexionar. Tus registros nos permiten personalizar tu orientación transdisciplinaria.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 shadow-sm mx-auto max-w-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN A: FÍSICO Y NUTRICIONAL */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-800">Cuerpo y Energía</h3>
            </div>
            <div className="flex gap-2">
              <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">Físico</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">Nutrición</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClases}>Horas de Sueño</label>
              <input type="number" step="0.1" name="horasSueno" required value={formData.horasSueno} onChange={handleChange} className={inputClases} placeholder="Ej. 7.5" min="0" />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <label className={labelClases}>Nivel de Energía</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <input type="range" name="nivelEnergia" min="1" max="10" value={formData.nivelEnergia} onChange={handleChange} className={sliderClases} />
                <div className="flex justify-between text-xs text-slate-400 font-medium mt-2">
                  <span>Agotado (1)</span>
                  <span className="text-blue-600 font-bold text-sm">{formData.nivelEnergia}/10</span>
                  <span>Radiante (10)</span>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClases}>Comidas Hoy</label>
              <div className="relative">
                <Utensils className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input type="number" name="comidasRealizadas" required value={formData.comidasRealizadas} onChange={handleChange} className={`${inputClases} pl-10`} min="0" max="10" />
              </div>
            </div>
            <div>
              <label className={labelClases}>Vasos de Agua</label>
              <div className="relative">
                <Droplet className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input type="number" name="vasosAgua" required value={formData.vasosAgua} onChange={handleChange} className={`${inputClases} pl-10`} min="0" />
              </div>
            </div>
            <div>
              <label className={labelClases}>Actividad Física</label>
              <select name="actividadFisica" value={formData.actividadFisica} onChange={handleChange} className={inputClases}>
                <option value="Ninguna">Ninguna</option>
                <option value="Ligera">Ligera (Caminar, estirar)</option>
                <option value="Moderada">Moderada (Trotar, gym)</option>
                <option value="Intensa">Intensa (Deporte)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN B: EMOCIONAL */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Brain className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-800">Mente y Emociones</h3>
            </div>
            <span className="bg-purple-50 text-purple-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">Psicología</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClases}>Estado General</label>
              <select name="estadoAnimo" value={formData.estadoAnimo} onChange={handleChange} className={inputClases}>
                <option value="Muy Bien">Muy Bien 😄</option>
                <option value="Bien">Bien 🙂</option>
                <option value="Regular">Regular 😐</option>
                <option value="Mal">Mal 😔</option>
                <option value="Muy Mal">Muy Mal 😫</option>
              </select>
            </div>
            <div>
              <label className={labelClases}>Emociones Predominantes</label>
              <input type="text" name="emocionesPredominantes" value={formData.emocionesPredominantes} onChange={handleChange} className={inputClases} placeholder="Ej. Calma, ansiedad, frustración..." />
            </div>
            <div>
              <label className={labelClases}>Nivel de Ánimo</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <input type="range" name="nivelAnimo" min="1" max="10" value={formData.nivelAnimo} onChange={handleChange} className={`${sliderClases} accent-purple-500`} />
                <div className="text-center text-sm font-bold text-purple-600 mt-2">{formData.nivelAnimo} / 10</div>
              </div>
            </div>
            <div>
              <label className={labelClases}>Nivel de Estrés</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <input type="range" name="nivelEstres" min="1" max="10" value={formData.nivelEstres} onChange={handleChange} className={`${sliderClases} accent-orange-500`} />
                <div className="text-center text-sm font-bold text-orange-600 mt-2">{formData.nivelEstres} / 10</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClases}>Diario Breve (Opcional)</label>
              <textarea name="notas" value={formData.notas} onChange={handleChange} className={`${inputClases} resize-none`} rows="2" placeholder="¿Hay algo en tu mente que quieras registrar hoy?"></textarea>
            </div>
          </div>
        </div>

        {/* SECCIÓN C: ACADÉMICO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-800">Estudio y Rendimiento</h3>
            </div>
            <span className="bg-orange-50 text-orange-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">C. de la Educación</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClases}>Horas de Estudio Extra</label>
              <input type="number" step="0.1" name="horasEstudio" required value={formData.horasEstudio} onChange={handleChange} className={inputClases} placeholder="Ej. 4.5" min="0" />
            </div>
            <div className="flex flex-col justify-center pt-6">
              <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="relative flex items-center">
                  <input type="checkbox" name="pausasEstudio" checked={formData.pausasEstudio} onChange={handleChange} className="peer w-6 h-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 checked:bg-orange-500 checked:border-orange-500 transition-all" />
                  <svg className="absolute w-4 h-4 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">Realicé pausas programadas (Ej. Pomodoro)</span>
              </label>
            </div>
            <div>
              <label className={labelClases}>Nivel de Concentración</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <input type="range" name="nivelConcentracion" min="1" max="10" value={formData.nivelConcentracion} onChange={handleChange} className={`${sliderClases} accent-orange-500`} />
                <div className="text-center text-sm font-bold text-orange-600 mt-2">{formData.nivelConcentracion} / 10</div>
              </div>
            </div>
            <div>
              <label className={labelClases}>Rendimiento Percibido</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <input type="range" name="rendimientoPercibido" min="1" max="10" value={formData.rendimientoPercibido} onChange={handleChange} className={`${sliderClases} accent-emerald-500`} />
                <div className="text-center text-sm font-bold text-emerald-600 mt-2">{formData.rendimientoPercibido} / 10</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Enviar */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="animate-pulse">Guardando análisis integral...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Guardar Registro de Bienestar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}