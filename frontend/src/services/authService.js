import api from './axiosInstance';

export const autenticar = (data) => api.post('/auth/login', data);
export const registrar = (data) => api.post('/auth/register', data);
