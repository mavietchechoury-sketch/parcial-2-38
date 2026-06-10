import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children, rolRequerido }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="spinner" />;

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/pedidos" replace />;
  }

  return children;
}
