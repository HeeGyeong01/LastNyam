import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // 로그인되지 않았으면 로그인 페이지로 리디렉트
    return <Navigate to="/login" replace />;
  }

  // 로그인되어 있으면 자식 컴포넌트 렌더링
  return <>{children}</>;
}
