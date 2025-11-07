export default function Login() {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const KAKAO_REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md">
        {/* 로고/제목 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">라스트냠</h1>
          <p className="text-gray-600">마감 임박 음식을 특별한 가격에</p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 0C4.477 0 0 3.68 0 8.222c0 2.866 1.867 5.388 4.694 6.868-.194.712-.634 2.367-.732 2.75-.117.458.168.452.354.329.154-.102 2.373-1.57 3.262-2.155C8.458 16.253 9.216 16.444 10 16.444c5.523 0 10-3.68 10-8.222S15.523 0 10 0z"
              fill="#000000"
            />
          </svg>
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
}

