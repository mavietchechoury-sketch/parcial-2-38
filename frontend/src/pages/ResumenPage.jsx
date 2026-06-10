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

  return (
    <div className="page">
      <h2>Panel de Resumen (Admin)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        <div className="card">
          <h3>Pedidos por estado</h3>
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
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <strong>Importe confirmado estimado: ${Number(data.importeConfirmado).toLocaleString()}</strong>
          </div>
        </div>

        <div className="card">
          <h3>Pedidos pendientes por fecha</h3>
          {data.pedidosPendientesPorFecha.length === 0 ? (
            <p style={{ color: '#666' }}>No hay pedidos pendientes.</p>
          ) : (
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
          )}
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>Cupos por menú activo</h3>
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
                return (
                  <tr key={m.menuId}>
                    <td>{m.nombre}</td>
                    <td>{m.fecha}</td>
                    <td>{m.cupoDiario}</td>
                    <td>{m.cupoUsado}</td>
                    <td>
                      <strong style={{ color: m.cupoRestante === 0 ? '#ea4335' : m.cupoRestante <= 3 ? '#f59e0b' : '#34a853' }}>
                        {m.cupoRestante}
                      </strong>
                    </td>
                    <td>
                      <div style={{ background: '#eee', borderRadius: '4px', height: '12px', width: '120px' }}>
                        <div style={{
                          background: porcentaje >= 90 ? '#ea4335' : porcentaje >= 60 ? '#fbbc04' : '#34a853',
                          width: `${porcentaje}%`,
                          height: '100%',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <small>{porcentaje}%</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
