import { useState } from 'react';
import { 
  HeartPulse, Smile, Moon, Activity, 
  FileText, CheckCircle2, X, Save, Loader2 
} from 'lucide-react';
import axios from 'axios';

export default function RegistroBienestar() {
  const [formData, setFormData] = useState({
    estadoAnimo: 'Bien',
    nivelEstres: '5',
    horasSueno: '',
    actividadFisica: 'Ninguna',
    notas: ''
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const payload = {
        estadoAnimo: formData.estadoAnimo,
        nivelEstres: parseInt(formData.nivelEstres),
        horasSueno: parseFloat(formData.horasSueno),
        actividadFisica: formData.actividadFisica,
        notas: formData.notas
      };

      await axios.post('http://localhost:8000/bienestar/registro', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmModal(false);
      setShowSuccess(true);
      
      setFormData({
        estadoAnimo: 'Bien',
        nivelEstres: '5',
        horasSueno: '',
        actividadFisica: 'Ninguna',
        notas: ''
      });

      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      
      // Capturamos el error real del backend para saber qué falla
      const mensajeReal = error.response?.data?.detail || error.response?.data?.message || error.message;
      alert(`Detalle del error: ${typeof mensajeReal === 'object' ? JSON.stringify(mensajeReal) : mensajeReal}`);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nuevo Registro de Bienestar</h1>
          <p className="text-sm text-slate-500">Registra tus métricas diarias de salud emocional y física</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 animate-fade-in-down">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <p className="font-bold">¡Registro guardado con éxito!</p>
            <p className="text-sm">Tus métricas de bienestar han sido guardadas en la base de datos.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Smile className="w-4 h-4 text-sky-500" /> Estado de Ánimo
            </label>
            <select 
              value={formData.estadoAnimo}
              onChange={(e) => setFormData({...formData, estadoAnimo: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-700"
            >
              <option value="Excelente">Excelente 😄</option>
              <option value="Bien">Bien 🙂</option>
              <option value="Regular">Regular 😐</option>
              <option value="Mal">Mal 😔</option>
              <option value="Muy Mal">Muy Mal 😫</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Horas de Sueño
            </label>
            <input 
              type="number" min="0" max="24" step="0.5" required
              placeholder="Ej. 7.5"
              value={formData.horasSueno}
              onChange={(e) => setFormData({...formData, horasSueno: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Activity className="w-4 h-4 text-amber-500" /> Nivel de Estrés (1 al 10)
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="1" max="10" 
              value={formData.nivelEstres}
              onChange={(e) => setFormData({...formData, nivelEstres: e.target.value})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="font-bold text-xl text-rose-600 w-8 text-center">{formData.nivelEstres}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 - Muy Relajado</span>
            <span>10 - Muy Estresado</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <HeartPulse className="w-4 h-4 text-emerald-500" /> Actividad Física
          </label>
          <select 
            value={formData.actividadFisica}
            onChange={(e) => setFormData({...formData, actividadFisica: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-700"
          >
            <option value="Ninguna">Ninguna</option>
            <option value="Ligera">Ligera (Caminar, estiramientos)</option>
            <option value="Moderada">Moderada (Trote, bicicleta, gimnasio suave)</option>
            <option value="Intensa">Intensa (Correr, entrenamiento pesado, deportes)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <FileText className="w-4 h-4 text-slate-400" /> Notas o Pensamientos (Opcional)
          </label>
          <textarea 
            rows="3"
            placeholder="¿Cómo te sentiste hoy? ¿Algún evento importante?"
            value={formData.notas}
            onChange={(e) => setFormData({...formData, notas: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 resize-none"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" /> Revisar y Continuar
          </button>
        </div>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-rose-50 p-6 text-center border-b border-rose-100 relative">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="absolute right-4 top-4 text-rose-400 hover:text-rose-600 bg-white rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Resumen de tu día</h2>
              <p className="text-sm text-slate-500 mt-1">Verifica que tus datos sean correctos antes de guardarlos.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Estado de Ánimo:</span>
                <span className="font-bold text-slate-800">{formData.estadoAnimo}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Horas de Sueño:</span>
                <span className="font-bold text-slate-800">{formData.horasSueno} h</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Nivel de Estrés:</span>
                <span className="font-bold text-rose-600">{formData.nivelEstres} / 10</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Actividad Física:</span>
                <span className="font-bold text-slate-800">{formData.actividadFisica}</span>
              </div>
              {formData.notas && (
                <div className="pt-1">
                  <span className="text-slate-500 text-sm font-medium block mb-1">Tus Notas:</span>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg italic">"{formData.notas}"</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-semibold rounded-xl transition-colors"
              >
                Volver a editar
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" /> Confirmar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}