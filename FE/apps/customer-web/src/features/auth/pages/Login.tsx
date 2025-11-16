import catImage from '@/shared/assets/lastnyam-cat.png';
import TypoLogo from '@/shared/assets/typo-logo.svg?react';

export default function Login() {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // 🔍 로그: 환경 변수 및 요청 URL 확인
    console.log('=== 카카오 로그인 요청 ===');
    console.log('VITE_API_BASE_URL:', API_BASE_URL);

    // 카카오 로그인 페이지로 직접 이동
    window.location.href = `${API_BASE_URL}/api/auth/social/kakao`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* 고양이 이미지 - 원형 배경 */}
        <div className="relative mb-4">
          <img src={catImage} alt="Last Nyam Cat" className="w-32 h-32 object-contain" />
        </div>

        {/* LAST NYAM 로고 */}
        <div className="mb-16">
          <TypoLogo className="h-7 w-auto aspect-[123/16]" />
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="w-full px-4">
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] p1-b text-primary py-4 px-6 rounded-full flex items-center justify-center gap-3"
          >
            {/* 카카오 말풍선 아이콘 */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 0C4.477 0 0 3.68 0 8.222c0 2.866 1.867 5.388 4.694 6.868-.194.712-.634 2.367-.732 2.75-.117.458.168.452.354.329.154-.102 2.373-1.57 3.262-2.155C8.458 16.253 9.216 16.444 10 16.444c5.523 0 10-3.68 10-8.222S15.523 0 10 0z"
                fill="#000000"
              />
            </svg>
            <span>카카오로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
