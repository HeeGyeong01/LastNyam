import { PageHeader } from '@/shared/components';
import { Button } from '@shared/components/Button';
import { queryClient } from '@/lib/queryClient';
import { logout as logoutApi } from '@/features/auth/api';

export default function MyPage() {
  const handleLogout = async () => {
    try {
      // 백엔드로 로그아웃 요청 (헤더에 토큰 자동 포함)
      await logoutApi();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      // API 호출 실패해도 프론트엔드 로그아웃은 진행
    }

    // React Query 캐시 초기화
    queryClient.invalidateQueries();

    // sessionStorage에 로그아웃 플래그 설정 (홈 페이지에서 로그아웃 처리)
    sessionStorage.setItem('shouldLogout', 'true');

    // 홈으로 이동 (로그아웃 상태 변경 전에 이동하여 PrivateRoute 리디렉트 방지)
    window.location.replace('/');
  };

  return (
    <>
      <PageHeader title="마이페이지" variant="light" />
      <div className="px-4 mt-2.5 pb-24">
        <h1 className="text-2xl font-bold text-center mb-4">마이페이지</h1>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto px-4 pb-20 bg-white">
        <Button btnStyle="filled-red" size="lg" onClick={handleLogout} className="w-full">
          로그아웃
        </Button>
      </div>
    </>
  );
}
