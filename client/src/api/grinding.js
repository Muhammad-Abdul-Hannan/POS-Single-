import api from './axios';

export const createGrindingLog = (payload) => api.post('/grinding', payload).then((res) => res.data);

export const listGrindingLogs = (params) => api.get('/grinding', { params }).then((res) => res.data);
