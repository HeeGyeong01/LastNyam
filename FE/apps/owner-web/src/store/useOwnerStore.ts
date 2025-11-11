import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  ownerId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthActions {
  login: (email: string, accessToken: string, refreshToken?: string, ownerId?: number) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
}

interface OwnerStore extends AuthState, AuthActions {}

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      email: null,
      ownerId: null,
      accessToken: null,
      refreshToken: null,

      // Actions
      login: (email, accessToken, refreshToken, ownerId) =>
        set({
          isAuthenticated: true,
          email,
          ownerId: ownerId || null,
          accessToken,
          refreshToken: refreshToken || null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          email: null,
          ownerId: null,
          accessToken: null,
          refreshToken: null,
        }),

      updateTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        })),
    }),
    {
      name: 'owner-auth-storage', // localStorage key
    }
  )
);

