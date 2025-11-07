import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function SignupComplete() {
  const navigate = useNavigate();

  useEffect(() => {
    // 3초 후 자동으로 홈으로 이동
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">회원가입 완료!</h1>
          <p className="text-gray-600 mb-8">
            환영합니다! 이제 모든 서비스를 이용하실 수 있어요.
          </p>
        </div>

        <button
          onClick={handleGoHome}
          className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
        >
          시작하기
        </button>

        <p className="text-sm text-gray-500 mt-4">3초 후 자동으로 이동합니다...</p>
      </div>
    </div>
  );
}

