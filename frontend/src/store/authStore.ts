import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;               // ⭐ Added
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: true, // ⭐ Zustand will update this automatically

      setAuth: (user, token) => {
        set({ user, token });
      },

      clearAuth: () => {
        set({ user: null, token: null });
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),

      // ⭐ Zustand persist callback — remove flickering
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      },
    }
  )
);

export const useIsAuthenticated = () => {
  return useAuthStore((state) => !!state.token && !!state.user);
};
