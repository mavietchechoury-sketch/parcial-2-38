import { useState, useEffect } from 'react';
import { getResumen } from '../services/pedidosService';

const BADGE = { pendiente: 'badge-pendiente', confirmado: 'badge-confirmado', cancelado: 'badge-cancelado', entregado: 'badge-entregado' };

export default function ResumenPage() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getResumen()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar el resumen'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="page"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!data) return null;

  const cantidadPorEstado = data.pedidosPorEstado.reduce((acc, item) => {
    acc[item.estado] = Number(item.cantidad);
    return acc;
  }, {});
  const cuposDisponibles = data.cuposPorMenu.reduce((acc, item) => acc + Number(item.cupoRestante || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Resumen administrativo</h1>
          <p className="page-subtitle">Vista consolidada de pedidos, estados, fechas pendientes y disponibilidad de menús activos.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Pedidos pendientes</div>
          <div className="kpi-value">{cantidadPorEstado.pendiente || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pedidos confirmados</div>
          <div className="kpi-value">{cantidadPorEstado.confirmado || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pedidos entregados</div>
          <div className="kpi-value">{cantidadPorEstado.entregado || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cupos disponibles</div>
          <div className="kpi-value">{cuposDisponibles}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Pedidos por estado</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Estado</th><th>Cantidad</th></tr>
              </thead>
              <tbody>
                {data.pedidosPorEstado.map((r) => (
                  <tr key={r.estado}>
                    <td><span className={`badge ${BADGE[r.estado] || ''}`}>{r.estado}</span></td>
                    <td>{r.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <strong>Importe confirmado estimado: ${Number(data.importeConfirmado).toLocaleString()}</strong>
          </div>
        </div>

        <div className="card">
          <h3>Pedidos pendientes por fecha</h3>
          {data.pedidosPendientesPorFecha.length === 0 ? (
            <p style={{ color: '#6B7280' }}>No hay pedidos pendientes.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Fecha</th><th>Pendientes</th></tr>
                </thead>
                <tbody>
                  {data.pedidosPendientesPorFecha.map((r) => (
                    <tr key={r.fecha}>
                      <td>{r.fecha}</td>
                      <td>{r.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card span-all">
          <h3>Cupos por menú activo</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Menú</th>
                  <th>Fecha</th>
                  <th>Cupo total</th>
                  <th>Usado</th>
                  <th>Restante</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {data.cuposPorMenu.map((m) => {
                  const porcentaje = Math.round((m.cupoUsado / m.cupoDiario) * 100);
                  const color = porcentaje >= 90 ? '#C65F63' : porcentaje >= 60 ? '#B89A4D' : '#5F8D6D';
                  return (
                    <tr key={m.menuId}>
                      <td>{m.nombre}</td>
                      <td>{m.fecha}</td>
                      <td>{m.cupoDiario}</td>
                      <td>{m.cupoUsado}</td>
                      <td>
                        <strong style={{ color: m.cupoRestante === 0 ? '#B4232A' : m.cupoRestante <= 3 ? '#9A6A00' : '#3F6F52' }}>
                          {m.cupoRestante}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className="availability-bar">
                            <div className="availability-fill" style={{ background: color, width: `${porcentaje}%` }} />
                          </div>
                          <small>{porcentaje}%</small>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
