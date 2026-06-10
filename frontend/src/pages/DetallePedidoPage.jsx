import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPedido, getHistorial, cancelarPedido, confirmarPedido, entregarPedido } from '../services/pedidosService';

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
      const [resPedido, resHistorial] = await Promise.all([getPedido(id), getHistorial(id)]);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Detalle del Pedido #{pedido.id}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/pedidos')}>← Volver</button>
      </div>

      {accionError && <div className="alert alert-error">{accionError}</div>}

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Menú:</strong> {pedido.menu?.nombre}</p>
            <p><strong>Tipo:</strong> {pedido.menu?.tipo}</p>
            <p><strong>Fecha:</strong> {pedido.fecha}</p>
            <p><strong>Turno:</strong> <span style={{ textTransform: 'capitalize' }}>{pedido.turnoEntrega}</span></p>
          </div>
          <div>
            <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
            <p><strong>Total:</strong> ${pedido.total?.toLocaleString()}</p>
            <p><strong>Punto de retiro:</strong> {pedido.puntoRetiro}</p>
            <p><strong>Estado:</strong> <span className={`badge ${BADGE[pedido.estado]}`}>{pedido.estado}</span></p>
          </div>
        </div>
        {pedido.observaciones && (
          <p style={{ marginTop: '0.75rem' }}><strong>Observaciones:</strong> {pedido.observaciones}</p>
        )}
        <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#666' }}>
          <strong>Solicitado por:</strong> {pedido.usuario?.nombre} ({pedido.usuario?.email})
        </p>

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
      </div>

      <div className="card">
        <h3>Historial de cambios</h3>
        {historial.length === 0 ? (
          <p style={{ color: '#666' }}>Sin registros de historial.</p>
        ) : (
          <ul className="historial-lista">
            {historial.map((h) => (
              <li key={h.id}>
                <span className="historial-accion">{h.accion}</span>
                {' · '}
                <span style={{ color: '#666' }}>{new Date(h.fechaHora).toLocaleString('es-AR')}</span>
                {' · '}
                <span>por {h.usuario?.nombre || `Usuario #${h.usuarioId}`}</span>
                {h.valorAnterior && (
                  <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#555' }}>
                    <span style={{ color: '#ea4335' }}>Antes: {JSON.stringify(h.valorAnterior)}</span>
                    {' → '}
                    <span style={{ color: '#34a853' }}>Después: {JSON.stringify(h.valorNuevo)}</span>
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
