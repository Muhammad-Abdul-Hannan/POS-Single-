import api from './axios';

export const listSuppliers = () => api.get('/suppliers').then((res) => res.data);

export const createSupplier = (payload) => api.post('/suppliers', payload).then((res) => res.data);

export const updateSupplier = (id, payload) => api.put(`/suppliers/${id}`, payload).then((res) => res.data);
