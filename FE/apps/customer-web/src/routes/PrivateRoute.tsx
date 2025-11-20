import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // persist 복원 대기 중일 수 있으므로 localStorage도 확인
  const localAccessToken = localStorage.getItem('accessToken');
  const localUserId = localStorage.getItem('userId');

  if (!isAuthenticated && (!localAccessToken || !localUserId)) {
    // 로그인되지 않았으면 로그인 페이지로 리디렉트
    return <Navigate to="/login" replace />;
  }

  // 로그인되어 있으면 자식 컴포넌트 렌더링
  return <>{children}</>;
}
