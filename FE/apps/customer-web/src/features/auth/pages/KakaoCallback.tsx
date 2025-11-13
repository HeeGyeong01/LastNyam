import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // 카카오 인증 코드로 백엔드에 로그인 요청
      handleKakaoLogin(code);
    } else {
      // 에러 처리
      console.error('카카오 로그인 실패');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleKakaoLogin = async (code: string) => {
    try {
      // TODO: 백엔드 API 호출
      console.log('카카오 인증 코드:', code);
      
      // 백엔드 응답에 따라 분기
      const isNewUser = true; // TODO: 실제 응답에서 확인
      
      if (isNewUser) {
        // 신규 회원 -> 추가정보 입력 페이지로
        navigate('/auth/additional-info');
      } else {
        // 기존 회원 -> 홈으로
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 처리 실패:', error);
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">로그인 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

