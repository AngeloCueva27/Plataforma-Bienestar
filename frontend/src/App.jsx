import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Componentes
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Páginas Estudiantes
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RegistroBienestar from './pages/RegistroBienestar';
import HistorialBienestar from './pages/HistorialBienestar';
import Recomendaciones from './pages/Recomendaciones';
import Metas from './pages/Metas';
import Perfil from './pages/Perfil';

// Páginas Administrador
import AdminUsuarios from './pages/AdminUsuarios';
import AdminEstudiantes from './pages/AdminEstudiantes';
import AdminAuditoria from './pages/AdminAuditoria';
import AdminRestablecer from './pages/AdminRestablecer';

// Páginas Especialistas (NUEVO)
import PanelEspecialista from './pages/PanelEspecialista';

function MainLayout() {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Rutas de Estudiante */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/bienestar/registrar" element={<RegistroBienestar />} />
            <Route path="/bienestar/historial" element={<HistorialBienestar />} />
            <Route path="/bienestar/recomendaciones" element={<Recomendaciones />} />
            <Route path="/bienestar/metas" element={<Metas />} />
            <Route path="/perfil" element={<Perfil />} />

            {/* Rutas de Especialista (NUEVO) */}
            <Route path="/bienestar/especialistas" element={<PanelEspecialista />} />

            {/* Rutas de Administrador */}
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/estudiantes" element={<AdminEstudiantes />} />
            <Route path="/admin/auditoria" element={<AdminAuditoria />} />
            <Route path="/admin/restablecer" element={<AdminRestablecer />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}