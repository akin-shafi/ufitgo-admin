import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isRefreshRequest = error.config?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest && !error.config?._refreshRetried) {
      try {
        refreshRequest ||= api.post('/admin/auth/refresh');
        const { data } = await refreshRequest;
        refreshRequest = null;
        localStorage.setItem('token', data.access_token);
        error.config._refreshRetried = true;
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(error.config);
      } catch (refreshError) {
        refreshRequest = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
