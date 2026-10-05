import api from './axios';

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((res) => res.data);

export const fetchMe = () => api.get('/auth/me').then((res) => res.data);

export const listUsers = () => api.get('/auth/users').then((res) => res.data);

export const createUser = (payload) => api.post('/auth/users', payload).then((res) => res.data);

export const changeMyPassword = (currentPassword, newPassword) =>
  api.patch('/auth/me/password', { currentPassword, newPassword }).then((res) => res.data);

export const resetUserPassword = (id, newPassword) =>
  api.patch(`/auth/users/${id}/password`, { newPassword }).then((res) => res.data);

export const setUserActive = (id, active) =>
  api.patch(`/auth/users/${id}/status`, { active }).then((res) => res.data);