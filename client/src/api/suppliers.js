import api from './axios';

export const listSuppliers = () => api.get('/suppliers').then((res) => res.data);

export const createSupplier = (payload) => api.post('/suppliers', payload).then((res) => res.data);

export const updateSupplier = (id, payload) => api.put(`/suppliers/${id}`, payload).then((res) => res.data);

export const recordPayment = (id, amount, note) =>
  api.post(`/suppliers/${id}/payments`, { amount, note }).then((res) => res.data);

export const listPayments = (id) => api.get(`/suppliers/${id}/payments`).then((res) => res.data);

export const getLedger = (id) => api.get(`/suppliers/${id}/ledger`).then((res) => res.data);