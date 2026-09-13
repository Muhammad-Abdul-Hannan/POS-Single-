import api from './axios';

export const listPurchases = () => api.get('/purchases').then((res) => res.data);

export const createPurchase = (payload) => api.post('/purchases', payload).then((res) => res.data);
