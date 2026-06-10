import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '5rem', color: '#1a73e8' }}>404</h1>
      <h2>Página no encontrada</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>La ruta que buscás no existe.</p>
      <Link to="/pedidos" className="btn btn-primary">Ir al inicio</Link>
    </div>
  );
}
