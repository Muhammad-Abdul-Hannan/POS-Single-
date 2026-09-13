import api from './axios';

export const getDashboardSummary = () => api.get('/reports/dashboard').then((res) => res.data);

export const getProfitLoss = (params) => api.get('/reports/profit-loss', { params }).then((res) => res.data);

export const getDailySales = (params) => api.get('/reports/daily-sales', { params }).then((res) => res.data);

export const getTopProducts = (params) => api.get('/reports/top-products', { params }).then((res) => res.data);

export const getLowStock = () => api.get('/reports/low-stock').then((res) => res.data);
