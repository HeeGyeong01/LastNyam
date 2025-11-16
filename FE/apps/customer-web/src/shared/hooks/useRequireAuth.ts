import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 로그인이 필요한 액션을 수행하기 전에 인증을 체크하는 훅
 *
 * @returns 로그인 체크 후 실행할 함수를 반환하는 함수
 */
export function useRequireAuth() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  /**
   * 로그인이 필요한 액션을 실행
   * 로그인되지 않았으면 로그인 페이지로 리디렉트
   *
   * @param action - 로그인 후 실행할 액션 (예: navigate 함수)
   */
  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      // localStorage에서도 확인 (persist 복원 대기 중일 수 있음)
      const localAccessToken = localStorage.getItem('accessToken');
      const localUserId = localStorage.getItem('userId');

      if (!localAccessToken || !localUserId) {
        navigate('/login');
        return;
      }
    }

    // 로그인되어 있으면 액션 실행
    action();
  };

  return requireAuth;
}
