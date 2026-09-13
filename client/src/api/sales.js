import api from './axios';

export const createSale = (payload) => api.post('/sales', payload).then((res) => res.data);

export const listSales = (params) => api.get('/sales', { params }).then((res) => res.data);

export const getSale = (id) => api.get(`/sales/${id}`).then((res) => res.data);
