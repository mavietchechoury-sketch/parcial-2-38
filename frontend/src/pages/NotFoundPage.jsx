import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page not-found">
      <div>
        <p className="eyebrow">Ruta no encontrada</p>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p className="page-subtitle" style={{ margin: '0 auto 1.5rem' }}>La ruta que buscás no existe.</p>
        <Link to="/pedidos" className="btn btn-primary">Ir al inicio</Link>
      </div>
    </div>
  );
}
