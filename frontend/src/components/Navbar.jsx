import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  if (!usuario) return null;

  return (
    <nav className="app-nav">
      <div className="nav-left">
        <strong className="brand"><span className="brand-mark">V</span> Viandas</strong>
        <div className="nav-links">
          <Link className="nav-link" to="/pedidos">Mis Pedidos</Link>
          <Link className="nav-link" to="/pedidos/nuevo">Nuevo Pedido</Link>
          {usuario.rol === 'admin' && <Link className="nav-link" to="/resumen">Resumen</Link>}
        </div>
      </div>
      <div className="nav-right">
        <span className="user-pill">
          <strong>{usuario.nombre}</strong> <span>({usuario.rol})</span>
        </span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
