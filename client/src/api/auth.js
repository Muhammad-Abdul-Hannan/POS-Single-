import api from './axios';

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((res) => res.data);

export const fetchMe = () => api.get('/auth/me').then((res) => res.data);

export const listUsers = () => api.get('/auth/users').then((res) => res.data);

export const createUser = (payload) => api.post('/auth/users', payload).then((res) => res.data);
