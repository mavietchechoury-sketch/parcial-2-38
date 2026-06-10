import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPedidos, cancelarPedido, confirmarPedido, entregarPedido } from '../services/pedidosService';

const BADGE = { pendiente: 'badge-pendiente', confirmado: 'badge-confirmado', cancelado: 'badge-cancelado', entregado: 'badge-entregado' };

export default function PedidosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filtros, setFiltros] = useState({ fecha: '', estado: '', menuId: '', tipo: '' });
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [accionError, setAccionError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const params = { ...filtros, page, limit: 8, sortBy: 'createdAt', order: 'DESC' };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await getPedidos(params);
      setPedidos(res.data.pedidos);
      setMeta({ total: res.data.total, page: res.data.page, totalPages: res.data.totalPages });
    } catch {
      setError('Error al cargar los pedidos');
    } finally {
      setCargando(false);
    }
  }, [filtros, page]);

  useEffect(() => { cargar(); }, [cargar]);

  async function accion(fn, id) {
    setAccionError('');
    try {
      await fn(id);
      cargar();
    } catch (err) {
      setAccionError(err.response?.data?.error || 'Error al realizar la acción');
    }
  }

  function handleFiltro(e) {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  }

  function limpiarFiltros() {
    setFiltros({ fecha: '', estado: '', menuId: '', tipo: '' });
    setPage(1);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pedidos</p>
          <h1>{usuario.rol !== 'admin' ? 'Mis pedidos' : 'Todos los pedidos'}</h1>
          <p className="page-subtitle">Consultá, filtrá y gestioná pedidos manteniendo toda la información operativa disponible.</p>
        </div>
        <Link to="/pedidos/nuevo" className="btn btn-primary">+ Nuevo pedido</Link>
      </div>

      <div className="card orders-toolbar">
        <div className="filters">
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" name="fecha" value={filtros.fecha} onChange={handleFiltro} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select name="estado" value={filtros.estado} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de menú</label>
            <select name="tipo" value={filtros.tipo} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option value="clasico">Clásico</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="vegano">Vegano</option>
              <option value="sin_tacc">Sin TACC</option>
            </select>
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        </div>
      </div>

      <div className="card table-card">
        {accionError && <div className="alert alert-error" style={{ margin: '1.25rem' }}>{accionError}</div>}
        {error && <div className="alert alert-error" style={{ margin: '1.25rem' }}>{error}</div>}

        {cargando ? (
          <div className="spinner" />
        ) : pedidos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280', padding: '2.5rem' }}>No hay pedidos para mostrar.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Menú</th>
                    <th>Fecha</th>
                    <th>Cant.</th>
                    <th>Total</th>
                    <th>Turno</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.menu?.nombre || '-'}</td>
                      <td>{p.fecha}</td>
                      <td>{p.cantidad}</td>
                      <td>${p.total?.toLocaleString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.turnoEntrega}</td>
                      <td><span className={`badge ${BADGE[p.estado]}`}>{p.estado}</span></td>
                      <td>
                        <div className="actions-cell">
                          <Link to={`/pedidos/${p.id}`} className="btn btn-outline btn-sm">Ver detalle</Link>
                          {(p.estado === 'pendiente' || p.estado === 'confirmado') && (
                            <button className="btn btn-warning btn-sm" onClick={() => navigate(`/pedidos/${p.id}/editar`)}>Editar</button>
                          )}
                          {(p.estado === 'pendiente' || p.estado === 'confirmado') && (
                            <button className="btn btn-danger btn-sm" onClick={() => accion(cancelarPedido, p.id)}>Cancelar</button>
                          )}
                          {usuario.rol === 'admin' && p.estado === 'pendiente' && (
                            <button className="btn btn-success btn-sm" onClick={() => accion(confirmarPedido, p.id)}>Confirmar</button>
                          )}
                          {usuario.rol === 'admin' && p.estado === 'confirmado' && (
                            <button className="btn btn-primary btn-sm" onClick={() => accion(entregarPedido, p.id)}>Entregar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <span>Pág {meta.page} de {meta.totalPages} ({meta.total} total)</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
