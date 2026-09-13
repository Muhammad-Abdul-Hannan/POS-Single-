import api from './axios';

export const listExpenses = (params) => api.get('/expenses', { params }).then((res) => res.data);

export const createExpense = (payload) => api.post('/expenses', payload).then((res) => res.data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
