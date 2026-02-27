import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      updateCredits: (newBalance) =>
        set((s) => ({
          user: s.user ? { ...s.user, creditAccount: { ...s.user.creditAccount, balance: newBalance } } : s.user,
        })),
    }),
    {
      name: 'vitacraft-auth',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);

export default useAuthStore;