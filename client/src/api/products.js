import api from './axios';

export const listProducts = () => api.get('/products').then((res) => res.data);

export const createProduct = (payload) => api.post('/products', payload).then((res) => res.data);

export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data);

export const adjustStock = (id, delta, reason) =>
  api.patch(`/products/${id}/stock`, { delta, reason }).then((res) => res.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);
