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
    const isNewUser = searchParams.get('isNewUser'); // 회원가입 여부 (백엔드에서 전달)
    const error = searchParams.get('error');

    if (error) {
      // 카카오 로그인 에러 처리
      console.error('카카오 로그인 에러:', error);
      alert('카카오 로그인에 실패했습니다.');
      navigate('/login');
      return;
    }

    // 신규 회원가입인 경우 (isNewUser === 'true')
    if (isNewUser === 'true') {
      if (!userId) {
        console.error('❌ userId가 없습니다.');
        alert('인증 정보가 없습니다.');
        navigate('/login');
        return;
      }

      console.log('✅ 신규 회원가입');
      console.log('userId:', userId);

      // 신규 회원가입인 경우 userId만 저장 (토큰은 추가 정보 입력 후 받을 수 있음)
      const userIdNum = parseInt(userId, 10);
      // localStorage에 userId 저장
      localStorage.setItem('userId', userIdNum.toString());
      // useAuthStore에도 userId만 설정 (토큰 없이)
      useAuthStore.setState({
        userId: userIdNum,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
      });

      // 추가 정보 입력 페이지로 이동
      navigate('/auth/additional-info');
      return;
    }

    // 기존 회원 로그인인 경우 (isNewUser === 'false' 또는 없음)
    // 기존 회원인 경우에만 accessToken과 refreshToken을 받음
    if (accessToken && refreshToken && userId) {
      console.log('✅ 백엔드로부터 토큰 수신 (기존 회원 로그인)');

      // Store에 로그인 정보 저장
      const userIdNum = parseInt(userId, 10);
      // localStorage에 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', userIdNum.toString());
      // useAuthStore에도 설정
      useAuthStore.setState({
        userId: userIdNum,
        isAuthenticated: true,
        accessToken,
        refreshToken,
      });

      // 로그인 후 React Query 캐시 무효화하여 새로운 데이터 가져오기
      queryClient.invalidateQueries();

      // 기존 회원 로그인인 경우 홈으로 이동
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
