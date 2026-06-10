import api from './axiosInstance';

export const getMenus = (params) => api.get('/menus', { params });
