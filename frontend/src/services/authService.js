import api from './api';

export const authService = {
  async register(email, password, nombre = '', ciclo = '1', rol = 'estudiante') {
    const response = await api.post('/auth/register', {
      email,
      password,
      nombre,
      ciclo,
      rol,
    });
    return response.data;
  },

  async login(email, password) {
    // FastAPI OAuth2PasswordRequestForm requiere x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};