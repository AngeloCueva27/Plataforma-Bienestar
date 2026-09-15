import api from './api';

export const bienestarService = {
  // Obtener historial de registros
  async getHistorial() {
    const response = await api.get('/bienestar/historial');
    return response.data;
  },

  // Obtener estadísticas agregadas
  async getEstadisticas() {
    const response = await api.get('/bienestar/estadisticas');
    return response.data;
  },

  // Crear/Guardar un nuevo registro diario
  async registrarDia(datos) {
    // Asegúrate de que termine en /registrar
    const response = await api.post('/bienestar/registrar', datos);
    return response.data;
  },
};