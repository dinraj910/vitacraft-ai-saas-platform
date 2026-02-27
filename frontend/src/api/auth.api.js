import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login:    (data) => axiosInstance.post('/auth/login', data),
  refresh:  (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken }),
  logout:   () => axiosInstance.post('/auth/logout'),
  getMe:    () => axiosInstance.get('/auth/me'),
};