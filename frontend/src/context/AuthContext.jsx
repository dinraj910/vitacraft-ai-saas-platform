import { createContext, useEffect } from 'react';
import { authAPI } from '../api/auth.api';
import useAuthStore from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { accessToken, setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (!accessToken) { setLoading(false); return; }
      try {
        const res  = await authAPI.getMe();
        const user = res.data.data;
        setAuth(user, accessToken, useAuthStore.getState().refreshToken);
      } catch {
        logout();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export default AuthContext;