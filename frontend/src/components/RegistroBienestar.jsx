import { useState } from 'react';
import { bienestarService } from '../services/bienestarService';

export function RegistroBienestar() {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horas_sueno: 7.5,
    actividad_fisica: true,
    actividad_fisica_tipo: 'Caminata',
    actividad_fisica_minutos: 30,
    nivel_estres: 5,
    nivel_animo: 5,
    emociones: 'Bien',
    horas_estudio: 4.0,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mapeo y conversión explícita de tipos de datos para FastAPI
    const payload = {
      fecha: formData.fecha,
      horas_sueno: parseFloat(formData.horas_sueno) || 0,
      actividad_fisica: Boolean(formData.actividad_fisica),
      actividad_fisica_tipo: formData.actividad_fisica_tipo || '',
      actividad_fisica_minutos: parseInt(formData.actividad_fisica_minutos, 10) || 0,
      nivel_estres: parseInt(formData.nivel_estres, 10) || 1,
      nivel_animo: parseInt(formData.nivel_animo, 10) || 1,
      emociones: formData.emociones || '',
      horas_estudio: parseFloat(formData.horas_estudio) || 0,
    };

    try {
      await bienestarService.registrarDia(payload);
      alert('Registro guardado correctamente');
    } catch (err) {
      console.error('Detalle del error:', err.response?.data);
      const msg = err.response?.data?.detail 
        ? JSON.stringify(err.response.data.detail) 
        : 'Error al procesar la solicitud';
      alert(`Error al guardar: ${msg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Nuevo Registro de Bienestar</h3>
      
      <div className="mb-3">
        <label className="block mb-1">Horas de sueño:</label>
        <input
          type="number"
          step="0.5"
          name="horas_sueno"
          value={formData.horas_sueno}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Nivel de Estrés (1-10):</label>
        <input
          type="number"
          name="nivel_estres"
          min="1"
          max="10"
          value={formData.nivel_estres}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Nivel de Ánimo (1-10):</label>
        <input
          type="number"
          name="nivel_animo"
          min="1"
          max="10"
          value={formData.nivel_animo}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Horas de estudio:</label>
        <input
          type="number"
          step="0.5"
          name="horas_estudio"
          value={formData.horas_estudio}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Minutos de Actividad Física:</label>
        <input
          type="number"
          name="actividad_fisica_minutos"
          value={formData.actividad_fisica_minutos}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Tipo de Actividad:</label>
        <input
          type="text"
          name="actividad_fisica_tipo"
          value={formData.actividad_fisica_tipo}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Notas / Emociones:</label>
        <textarea
          name="emociones"
          value={formData.emociones}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Guardar Día
      </button>
    </form>
  );
}