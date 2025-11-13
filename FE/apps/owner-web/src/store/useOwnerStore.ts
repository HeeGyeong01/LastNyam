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

export interface Menu {
  menuId: number;
  menuName: string;
  menuDescription: string;
  menuImage: string;
  menuPrice: number;
  categoryName: string;
}

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  ownerId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  shops: Shop[];
  postAuthRedirectPath: string | null;
  shouldPreventPublicRedirect: boolean;
}

interface MenuState {
  menus: Menu[];
  isMenusLoading: boolean;
  lastMenusFetchedAt: number | null;
}

interface AuthActions {
  login: (email: string, accessToken: string, refreshToken?: string, ownerId?: number) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  setShops: (shops: Shop[]) => void;
  setPostAuthRedirect: (path: string | null) => void;
  setShouldPreventPublicRedirect: (value: boolean) => void;
}

interface MenuActions {
  setMenus: (menus: Menu[]) => void;
  setMenusLoading: (isLoading: boolean) => void;
  addMenu: (menu: Menu) => void;
  updateMenu: (menuId: number, updates: Partial<Menu>) => void;
  deleteMenu: (menuId: number) => void;
  clearMenus: () => void;
  getMenuById: (menuId: number) => Menu | undefined;
}

interface OwnerStore extends AuthState, MenuState, AuthActions, MenuActions {}

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set, get) => ({
      // Initial state - Auth
      isAuthenticated: false,
      email: null,
      ownerId: null,
      accessToken: null,
      refreshToken: null,
      shops: [],
      postAuthRedirectPath: null,
      shouldPreventPublicRedirect: false,

      // Initial state - Menu
      menus: [],
      isMenusLoading: false,
      lastMenusFetchedAt: null,

      // Auth Actions
      login: (email, accessToken, refreshToken, ownerId) =>
        set({
          isAuthenticated: true,
          email,
          ownerId: ownerId || null,
          accessToken,
          refreshToken: refreshToken || null,
          // shouldPreventPublicRedirect는 건드리지 않음 (기존 값 유지)
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          email: null,
          ownerId: null,
          accessToken: null,
          refreshToken: null,
          shops: [],
          postAuthRedirectPath: null,
          shouldPreventPublicRedirect: false,
          menus: [],
          isMenusLoading: false,
          lastMenusFetchedAt: null,
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

      setPostAuthRedirect: (path) =>
        set({
          postAuthRedirectPath: path,
        }),

      setShouldPreventPublicRedirect: (value) =>
        set({
          shouldPreventPublicRedirect: value,
        }),

      // Menu Actions
      setMenus: (menus) =>
        set({
          menus,
          lastMenusFetchedAt: Date.now(),
        }),

      setMenusLoading: (isLoading) =>
        set({
          isMenusLoading: isLoading,
        }),

      addMenu: (menu) =>
        set((state) => ({
          menus: [...state.menus, menu],
        })),

      updateMenu: (menuId, updates) =>
        set((state) => ({
          menus: state.menus.map((menu) =>
            menu.menuId === menuId ? { ...menu, ...updates } : menu
          ),
        })),

      deleteMenu: (menuId) =>
        set((state) => ({
          menus: state.menus.filter((menu) => menu.menuId !== menuId),
        })),

      clearMenus: () =>
        set({
          menus: [],
          isMenusLoading: false,
          lastMenusFetchedAt: null,
        }),

      getMenuById: (menuId) => {
        const state = get();
        return state.menus.find((menu) => menu.menuId === menuId);
      },
    }),
    {
      name: 'owner-auth-storage', // localStorage key
    }
  )
);

