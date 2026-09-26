import api from './api';

export const aiService = {
  enviarMensajeChat: async (contenido) => {
    const response = await api.post('/ai/chat', { contenido });
    return response.data;
  },
  
  obtenerHistorial: async () => {
    const response = await api.get('/ai/historial');
    return response.data;
  },

  limpiarHistorial: async () => {
    const response = await api.delete('/ai/historial');
    return response.data;
  }
};