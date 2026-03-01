import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import useAuthStore from '../store/authStore';

const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setAuth, logout: storeLogout } = useAuthStore();

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user, accessToken, refreshToken } = res.data.data;
    setAuth(user, accessToken, refreshToken || '');
    navigate('/dashboard');
    return res.data;
  };

  const login = async (data) => {
    const res = await authAPI.login(data);
    const { user, accessToken, refreshToken } = res.data.data;
    setAuth(user, accessToken, refreshToken || '');
    navigate('/dashboard');
    return res.data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    storeLogout();
    navigate('/login');
  };

  return { user, isAuthenticated, isLoading, register, login, logout };
};

export default useAuth;