import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Activity } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Cambiado a 'nombre' para coincidir con la BD
  const [ciclo, setCiclo] = useState('');   // Nuevo estado para el ciclo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // El payload ahora coincide exactamente con lo que espera FastAPI y SQLAlchemy
      await api.post('/auth/register', {
        email,
        password,
        nombre,
        ciclo,
        rol: 'estudiante' // Enviamos el rol por defecto
      });
      navigate('/login');
    } catch (err) {
      // Mejora para capturar los errores de validación de Pydantic (como el min_length de 8 caracteres)
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail[0].msg);
      } else {
        setError(err.response?.data?.detail || 'Error al registrar la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-full mb-2">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
          <p className="text-slate-500 text-sm">Regístrate para comenzar a monitorear tu bienestar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Tu Nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo Académico</label>
            <select
              required
              value={ciclo}
              onChange={(e) => setCiclo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              <option value="" disabled>Selecciona tu ciclo</option>
              <option value="1">I Ciclo</option>
              <option value="2">II Ciclo</option>
              <option value="3">III Ciclo</option>
              <option value="4">IV Ciclo</option>
              <option value="5">V Ciclo</option>
              <option value="6">VI Ciclo</option>
              <option value="7">VII Ciclo</option>
              <option value="8">VIII Ciclo</option>
              <option value="9">IX Ciclo</option>
              <option value="10">X Ciclo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="tu@undac.edu.pe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-1">Debe tener al menos 8 caracteres.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sky-600 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}