import api from './axiosInstance';

export const getPedidos = (params) => api.get('/pedidos', { params });
export const getPedido = (id) => api.get(`/pedidos/${id}`);
export const getHistorial = (id) => api.get(`/pedidos/${id}/historial`);
export const getResumen = () => api.get('/pedidos/resumen');
export const createPedido = (data) => api.post('/pedidos', data);
export const updatePedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const cancelarPedido = (id) => api.patch(`/pedidos/${id}/cancelar`);
export const confirmarPedido = (id) => api.patch(`/pedidos/${id}/confirmar`);
export const entregarPedido = (id) => api.patch(`/pedidos/${id}/entregar`);
