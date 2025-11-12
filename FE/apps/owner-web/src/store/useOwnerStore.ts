import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Shop {
  shopId: number;
  shopName: string;
  shopLat: number;
  shopLng: number;
  shopAddress: string;
  shopDescription?: string;
  shopBanner?: string;
  shopCloses?: string;
  shopPickupEndTime?: string;
  categoryName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  ownerId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  shops: Shop[];
}

interface AuthActions {
  login: (email: string, accessToken: string, refreshToken?: string, ownerId?: number) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  setShops: (shops: Shop[]) => void;
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
      shops: [],

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
          shops: [],
        }),

      updateTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        })),

      setShops: (shops) =>
        set({
          shops,
        }),
    }),
    {
      name: 'owner-auth-storage', // localStorage key
    }
  )
);

