import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getMenus } from '../services/menusService';
import { createPedido, getPedido, updatePedido } from '../services/pedidosService';

export default function FormularioPedidoPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [apiError, setApiError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { cantidad: 1, turnoEntrega: 'almuerzo' },
  });

  const fechaSeleccionada = watch('fecha');
  const menuSeleccionado = watch('menuId');
  const cantidadSeleccionada = watch('cantidad');

  useEffect(() => {
    if (!fechaSeleccionada) {
      setMenus([]);
      return;
    }
    getMenus({ fecha: fechaSeleccionada, activo: true }).then((res) => setMenus(res.data));
  }, [fechaSeleccionada]);

  useEffect(() => {
    if (!esEdicion) return;
    setCargando(true);
    getPedido(id).then((res) => {
      const p = res.data;
      setValue('fecha', p.fecha);
      setValue('menuId', p.menuId);
      setValue('cantidad', p.cantidad);
      setValue('turnoEntrega', p.turnoEntrega);
      setValue('puntoRetiro', p.puntoRetiro);
      setValue('observaciones', p.observaciones || '');
      getMenus({ fecha: p.fecha, activo: true }).then((r) => setMenus(r.data));
    }).catch(() => setApiError('No se pudo cargar el pedido')).finally(() => setCargando(false));
  }, [id]);

  const menuActual = menus.find((m) => m.id === parseInt(menuSeleccionado));
  const precioUnitario = menuActual?.precio || 0;
  const totalEstimado = (parseInt(cantidadSeleccionada) || 0) * precioUnitario;

  async function onSubmit(data) {
    setApiError('');
    try {
      const payload = {
        menuId: parseInt(data.menuId),
        fecha: data.fecha,
        cantidad: parseInt(data.cantidad),
        turnoEntrega: data.turnoEntrega,
        puntoRetiro: data.puntoRetiro,
        observaciones: data.observaciones || undefined,
      };
      if (esEdicion) {
        await updatePedido(id, payload);
      } else {
        await createPedido(payload);
      }
      navigate('/pedidos');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al guardar el pedido');
    }
  }

  if (cargando) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pedido</p>
          <h1>{esEdicion ? 'Editar pedido' : 'Nuevo pedido'}</h1>
          <p className="page-subtitle">Completá los datos del menú, fecha, entrega y retiro del pedido.</p>
        </div>
      </div>

      <div className="card form-card">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Fecha del pedido</label>
              <input
                type="date"
                {...register('fecha', { required: 'La fecha es requerida' })}
              />
              {errors.fecha && <p className="form-error">{errors.fecha.message}</p>}
            </div>

            <div className="form-group">
              <label>Menú disponible</label>
              <select {...register('menuId', { required: 'Seleccioná un menú' })}>
                <option value="">Seleccioná un menú</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.tipo}) - ${m.precio?.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.menuId && <p className="form-error">{errors.menuId.message}</p>}
              {!fechaSeleccionada && <p className="form-helper">Seleccioná una fecha para ver los menús disponibles.</p>}
              {fechaSeleccionada && menus.length === 0 && <p className="form-error">No hay menús activos para esa fecha.</p>}
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                {...register('cantidad', { required: 'La cantidad es requerida', min: { value: 1, message: 'Debe ser mayor a 0' } })}
              />
              {errors.cantidad && <p className="form-error">{errors.cantidad.message}</p>}
            </div>

            <div className="form-group">
              <label>Turno de entrega</label>
              <select {...register('turnoEntrega', { required: 'Seleccioná un turno' })}>
                <option value="almuerzo">Almuerzo</option>
                <option value="cena">Cena</option>
              </select>
            </div>

            <div className="form-group full">
              <label>Punto de retiro</label>
              <input
                {...register('puntoRetiro', { required: 'El punto de retiro es requerido' })}
                placeholder="Ej: Campus - Buffet A"
              />
              {errors.puntoRetiro && <p className="form-error">{errors.puntoRetiro.message}</p>}
            </div>

            <div className="form-group full">
              <label>Observaciones (opcional)</label>
              <textarea {...register('observaciones')} rows={3} placeholder="Sin sal, extra salsa..." />
            </div>
          </div>

          {menuActual && (
            <div className="alert alert-info">
              <strong>Total estimado: ${totalEstimado.toLocaleString()}</strong>
              <br /><small>El total final es calculado y confirmado por el servidor.</small>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/pedidos')}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear pedido')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
