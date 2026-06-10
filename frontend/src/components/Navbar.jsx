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
    <nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <strong>Viandas</strong>
        <Link to="/pedidos">Mis Pedidos</Link>
        <Link to="/pedidos/nuevo">Nuevo Pedido</Link>
        {usuario.rol === 'admin' && <Link to="/resumen">Resumen</Link>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.88rem' }}>
          {usuario.nombre} <span style={{ opacity: 0.75 }}>({usuario.rol})</span>
        </span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
