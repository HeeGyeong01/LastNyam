import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { queryClient } from '@/lib/queryClient';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const error = searchParams.get('error');

    if (error) {
      // 카카오 로그인 에러 처리
      console.error('카카오 로그인 에러:', error);
      alert('카카오 로그인에 실패했습니다.');
      navigate('/login');
      return;
    }

    // 백엔드에서 토큰을 전달받은 경우
    if (accessToken && refreshToken && userId) {
      console.log('✅ 백엔드로부터 토큰 수신');

      // Store에 로그인 정보 저장 (내부적으로 localStorage도 함께 저장)
      const userIdNum = parseInt(userId, 10);
      login(accessToken, refreshToken, userIdNum);

      // 로그인 후 React Query 캐시 무효화하여 새로운 데이터 가져오기
      queryClient.invalidateQueries();

      // 홈으로 이동
      navigate('/');
      return;
    }

    // 토큰이 없는 경우
    console.error('❌ 인증 정보가 없습니다.');
    alert('인증 정보가 없습니다.');
    navigate('/login');
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">로그인 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
