import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerPedido, obtenerHistorial, cancelarPedido, confirmarPedido, entregarPedido } from '../services/pedidosService';

const BADGE = { pendiente: 'badge-pendiente', confirmado: 'badge-confirmado', cancelado: 'badge-cancelado', entregado: 'badge-entregado' };

export default function DetallePedidoPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accionError, setAccionError] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [resPedido, resHistorial] = await Promise.all([obtenerPedido(id), obtenerHistorial(id)]);
      setPedido(resPedido.data);
      setHistorial(resHistorial.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el pedido');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, [id]);

  async function accion(fn) {
    setAccionError('');
    try {
      await fn(id);
      cargar();
    } catch (err) {
      setAccionError(err.response?.data?.error || 'Error al realizar la acción');
    }
  }

  if (cargando) return <div className="page"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div><Link to="/pedidos" className="btn btn-secondary">Volver</Link></div>;
  if (!pedido) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Detalle</p>
          <h1>Pedido #{pedido.id}</h1>
          <p className="page-subtitle">Información completa del pedido, estado operativo e historial de cambios.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/pedidos')}>Volver</button>
      </div>

      {accionError && <div className="alert alert-error">{accionError}</div>}

      <div className="detail-grid">
        <section className="info-card">
          <h3>Información general</h3>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Fecha</span><span className="info-value">{pedido.fecha}</span></div>
            <div className="info-row"><span className="info-label">Turno</span><span className="info-value" style={{ textTransform: 'capitalize' }}>{pedido.turnoEntrega}</span></div>
            <div className="info-row"><span className="info-label">Cantidad</span><span className="info-value">{pedido.cantidad}</span></div>
            <div className="info-row"><span className="info-label">Punto de retiro</span><span className="info-value">{pedido.puntoRetiro}</span></div>
          </div>
        </section>

        <section className="info-card">
          <h3>Menú</h3>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Nombre</span><span className="info-value">{pedido.menu?.nombre}</span></div>
            <div className="info-row"><span className="info-label">Tipo</span><span className="info-value">{pedido.menu?.tipo}</span></div>
            <div className="info-row"><span className="info-label">Total</span><span className="info-value">${pedido.total?.toLocaleString()}</span></div>
            <div className="info-row"><span className="info-label">Estado</span><span className="info-value"><span className={`badge ${BADGE[pedido.estado]}`}>{pedido.estado}</span></span></div>
          </div>
        </section>

        <section className="info-card">
          <h3>Estado</h3>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Solicitado por</span>
              <span className="info-value">{pedido.usuario?.nombre}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{pedido.usuario?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Observaciones</span>
              <span className="info-value">{pedido.observaciones || 'Sin observaciones'}</span>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>Acciones</h3>
          <div className="actions-cell">
            {(pedido.estado === 'pendiente' || pedido.estado === 'confirmado') && (
              <Link to={`/pedidos/${id}/editar`} className="btn btn-warning">Editar</Link>
            )}
            {(pedido.estado === 'pendiente' || pedido.estado === 'confirmado') && (
              <button className="btn btn-danger" onClick={() => accion(cancelarPedido)}>Cancelar</button>
            )}
            {usuario.rol === 'admin' && pedido.estado === 'pendiente' && (
              <button className="btn btn-success" onClick={() => accion(confirmarPedido)}>Confirmar</button>
            )}
            {usuario.rol === 'admin' && pedido.estado === 'confirmado' && (
              <button className="btn btn-primary" onClick={() => accion(entregarPedido)}>Marcar entregado</button>
            )}
          </div>
        </section>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Historial de cambios</h3>
        {historial.length === 0 ? (
          <p style={{ color: '#6B7280' }}>Sin registros de historial.</p>
        ) : (
          <ul className="historial-lista">
            {historial.map((h) => (
              <li key={h.id}>
                <span className="historial-accion">{h.accion}</span>
                {' · '}
                <span style={{ color: '#6B7280' }}>{new Date(h.fechaHora).toLocaleString('es-AR')}</span>
                {' · '}
                <span>por {h.usuario?.nombre || `Usuario #${h.usuarioId}`}</span>
                {h.valorAnterior && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: '#555' }}>
                    <span style={{ color: '#B4232A' }}>Antes: {JSON.stringify(h.valorAnterior)}</span>
                    {' -> '}
                    <span style={{ color: '#3F6F52' }}>Después: {JSON.stringify(h.valorNuevo)}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
