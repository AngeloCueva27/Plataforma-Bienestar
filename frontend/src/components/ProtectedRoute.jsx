import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-slate-600">Cargando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};