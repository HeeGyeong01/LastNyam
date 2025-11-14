import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      // 카카오 로그인 에러 처리
      console.error('카카오 로그인 에러:', error);
      // 부모 창에 에러 메시지 전송
      if (window.opener) {
        window.opener.postMessage(
          { type: 'KAKAO_LOGIN_ERROR', error },
          window.location.origin
        );
      }
      window.close();
      return;
    }
    
    if (code) {
      // 부모 창에 성공 메시지와 코드 전송
      if (window.opener) {
        window.opener.postMessage(
          { type: 'KAKAO_LOGIN_SUCCESS', code },
          window.location.origin
        );
      }
      // 팝업 창 닫기
      window.close();
    } else {
      // 코드가 없는 경우
      console.error('카카오 인증 코드가 없습니다.');
      if (window.opener) {
        window.opener.postMessage(
          { type: 'KAKAO_LOGIN_ERROR', error: '인증 코드가 없습니다.' },
          window.location.origin
        );
      }
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">로그인 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

