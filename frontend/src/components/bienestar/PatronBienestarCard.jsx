import React from 'react';

const PatronBienestarCard = ({ registros }) => {
  // Regla: Necesitamos al menos 3 registros para analizar
  if (!registros || registros.length < 3) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Análisis de Patrones</h3>
        <p className="text-gray-500 italic text-sm">
          Aún no existen suficientes registros para identificar patrones. Completa al menos 3 registros diarios.
        </p>
      </div>
    );
  }

  // Lógica determinística simple de correlación
  let mensajePatron = "Tus métricas se mantienen estables esta semana. ¡Sigue así!";
  
  const diasPocoSueno = registros.filter(r => r.horas_sueno < 6);
  const diasMuchoEstres = registros.filter(r => r.nivel_estres >= 8);
  const diasConPausas = registros.filter(r => r.pausas_estudio === true);

  if (diasPocoSueno.length >= 2) {
    const concentracionPromedioPocoSueno = diasPocoSueno.reduce((acc, r) => acc + (r.nivel_concentracion || 5), 0) / diasPocoSueno.length;
    if (concentracionPromedioPocoSueno <= 5) {
      mensajePatron = "En los días con menos de 6 horas de sueño, tu concentración promedio tendió a disminuir.";
    }
  } else if (diasMuchoEstres.length >= 2) {
    mensajePatron = "Durante los días con estrés alto, registraste menos horas de descanso y menor nivel de ánimo.";
  } else if (diasConPausas.length >= 2) {
    mensajePatron = "¡Excelente! Cuando realizaste pausas durante el estudio, tu concentración y rendimiento se mantuvieron altos.";
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>🧩</span> Patrón Identificado
      </h3>
      <p className="text-gray-700 font-medium mb-4">
        {mensajePatron}
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">[Psicología]</span>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">[Nutrición]</span>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">[Ciencias de la Educación]</span>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">[Informática]</span>
      </div>
    </div>
  );
};

export default PatronBienestarCard;