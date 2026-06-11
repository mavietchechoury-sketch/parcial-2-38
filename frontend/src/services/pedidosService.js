import api from './axiosInstance';

export const obtenerPedidos = (params) => api.get('/pedidos', { params });
export const obtenerPedido = (id) => api.get(`/pedidos/${id}`);
export const obtenerHistorial = (id) => api.get(`/pedidos/${id}/historial`);
export const obtenerResumen = () => api.get('/pedidos/resumen');
export const crearPedido = (data) => api.post('/pedidos', data);
export const editarPedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const cancelarPedido = (id) => api.patch(`/pedidos/${id}/cancelar`);
export const confirmarPedido = (id) => api.patch(`/pedidos/${id}/confirmar`);
export const entregarPedido = (id) => api.patch(`/pedidos/${id}/entregar`);
