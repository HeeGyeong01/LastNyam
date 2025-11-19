import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 인증 상태 인터페이스
 * - isAuthenticated: 로그인 여부
 * - userId: 사용자 ID (로그인 시에만 값이 있음)
 * - accessToken: API 요청 시 사용하는 액세스 토큰
 * - refreshToken: accessToken 만료 시 새로 발급받기 위한 리프레시 토큰
 * - nickname: 사용자 닉네임
 */
interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  nickname: string | null;
}

/**
 * 인증 관련 액션 인터페이스
 * - login: 로그인 시 호출 (토큰과 userId 저장)
 * - logout: 로그아웃 시 호출 (모든 인증 정보 제거)
 * - updateTokens: 토큰 갱신 시 호출 (refreshToken으로 새 accessToken 발급 후)
 * - syncFromLocalStorage: localStorage에서 직접 읽어서 store 동기화
 */
interface AuthActions {
  login: (accessToken: string, refreshToken: string, userId: number) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  syncFromLocalStorage: () => void;
  setNickname: (nickname: string) => void;
}

/**
 * 인증 Store 전체 인터페이스
 * AuthState와 AuthActions를 합친 타입
 */
interface AuthStore extends AuthState, AuthActions {}

/**
 * 인증 상태 관리 Store
 * persist 미들웨어를 사용 (localStorage에 자동 저장/복원)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ========== 초기 상태 ==========
      isAuthenticated: false,  // 로그인 전 기본값: false
      userId: null,            // 로그인 전 기본값: null
      accessToken: null,       // 로그인 전 기본값: null
      refreshToken: null,      // 로그인 전 기본값: null
      nickname: null,          // 로그인 전 기본값: null

      // ========== 액션 함수들 ==========

      /**
       * 로그인 함수
       * 
       * 카카오 로그인 성공 후 호출됩니다.
       * - Store 상태 업데이트
       * - localStorage에도 저장 (기존 코드와의 호환성 유지)
       * 
       * @param accessToken - API 요청 시 사용할 액세스 토큰
       * @param refreshToken - 토큰 갱신 시 사용할 리프레시 토큰
       * @param userId - 사용자 ID
       */
      login: (accessToken, refreshToken, userId) => {
        // localStorage에도 저장 (기존 코드와 호환성 유지)
        // apiClient의 interceptor가 localStorage에서 토큰을 읽어서 사용
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId.toString());
        
        // Store 상태 업데이트
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          userId,
        });
      },

      /**
       * 로그아웃 함수
       * 
       * 사용자 로그아웃 시 호출됩니다.
       * - Store 상태 초기화
       * - localStorage에서도 모든 인증 정보 제거
       */
      logout: () => {
        // localStorage에서도 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        
        // Store 상태 초기화
        set({
          isAuthenticated: false,
          userId: null,
          accessToken: null,
          refreshToken: null,
          nickname: null,
        });
      },

      /**
       * 토큰 갱신 함수
       * 
       * accessToken이 만료되어 refreshToken으로 새 accessToken을 발급받은 후 호출됩니다.
       * - 새 accessToken으로 업데이트
       * - refreshToken은 선택적으로 업데이트 (없으면 기존 값 유지)
       * - localStorage에도 함께 업데이트
       * 
       * @param accessToken - 새로 발급받은 액세스 토큰
       * @param refreshToken - 새로 발급받은 리프레시 토큰 (선택적)
       */
      updateTokens: (accessToken, refreshToken) => {
        // localStorage에도 업데이트
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Store 상태 업데이트
        // refreshToken이 없으면 기존 값 유지
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        }));
      },

      /**
       * localStorage에서 직접 읽어서 Store 동기화
       * 
       * 앱 시작 시(App.tsx) 호출됩니다.
       * 기존에 localStorage에만 저장된 경우를 대비하여
       * localStorage의 값을 읽어서 Store 상태를 동기화합니다.
       * 
       * 사용 시나리오:
       * - 페이지 새로고침 시 persist 미들웨어가 자동 복원하지만,
       * - 혹시 모를 동기화 문제를 방지하기 위해 명시적으로 호출
       */
      syncFromLocalStorage: () => {
        // localStorage에서 값 읽기
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;

        // accessToken과 userId가 모두 있으면 로그인 상태로 설정
        if (accessToken && userId) {
          set({
            isAuthenticated: true,
            accessToken,
            refreshToken: refreshToken || null,
            userId,
          });
        } else {
          // 없으면 로그아웃 상태로 설정
          set({
            isAuthenticated: false,
            userId: null,
            accessToken: null,
            refreshToken: null,
            nickname: null,
          });
        }
      },

      /**
       * 닉네임 설정 함수
       * 
       * 사용자 정보 조회 후 닉네임을 저장할 때 사용됩니다.
       * 
       * @param nickname - 사용자 닉네임
       */
      setNickname: (nickname) => {
        set({ nickname });
      },
    }),
    {
      // ========== persist 옵션 ==========
      
      /**
       * localStorage에 저장될 키 이름
       * 브라우저 개발자 도구 > Application > Local Storage에서 확인 가능
       */
      name: 'customer-auth-storage',
      
      /**
       * 어떤 상태만 localStorage에 저장할지 선택
       * 
       * 모든 상태를 저장하되, 함수는 제외하고 값만 저장합니다.
       * persist 미들웨어가 자동으로 JSON 직렬화/역직렬화를 처리합니다.
       */
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        nickname: state.nickname,
      }),
    }
  )
);

