import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,    // 60s — cloud LLM APIs respond in seconds
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue = [];
const flush = (token) => { queue.forEach((cb) => cb(token)); queue = []; };

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (error.response?.status === 401 && !orig._retry && refreshToken) {
      if (isRefreshing) return new Promise((r) => queue.push((t) => { orig.headers.Authorization = `Bearer ${t}`; r(axiosInstance(orig)); }));

      orig._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken }, { withCredentials: true });
        const { accessToken: at, refreshToken: rt } = res.data.data;
        setTokens(at, rt);
        flush(at);
        isRefreshing = false;
        orig.headers.Authorization = `Bearer ${at}`;
        return axiosInstance(orig);
      } catch {
        isRefreshing = false;
        queue = [];
        logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;