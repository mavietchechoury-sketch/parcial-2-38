import api from './axiosInstance';

export const obtenerMenus = (params) => api.get('/menus', { params });
