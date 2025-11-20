import { useEffect } from 'react';
import { PageHeader } from '@/shared/components';
import { Button } from '@shared/components/Button';
import { queryClient } from '@/lib/queryClient';
import { logout as logoutApi } from '@/features/auth/api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserInfo } from '../api';
import type { UserInfo } from '../type';
import lastnyamCatImage from '@/shared/assets/lastnyam-cat.png';

export default function MyPage() {
  const userId = useAuthStore((state) => state.userId);
  const nickname = useAuthStore((state) => state.nickname);
  const setNickname = useAuthStore((state) => state.setNickname);

  // 사용자 정보 조회 (nickname이 없을 때만)
  const { data: userInfo } = useQuery<UserInfo>({
    queryKey: ['userInfo', userId],
    queryFn: () => getUserInfo(userId ?? undefined),
    enabled: !!userId && !nickname, // nickname이 없을 때만 호출
  });

  // API로 가져온 nickname을 store에 저장
  useEffect(() => {
    if (userInfo?.nickname && !nickname) {
      setNickname(userInfo.nickname);
    }
  }, [userInfo?.nickname, nickname, setNickname]);

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
      <div className="w-full flex flex-col px-4 mt-16 items-center">
        <img
          className="w-48 h-48 object-contain mb-6"
          src={lastnyamCatImage}
          alt="프로필"
        />
        <div className="flex flex-col justify-start items-center gap-3">
          <div className="flex justify-start">
            <p className="text-primary h3 mr-1">안녕하세요,</p>
            <p className="text-primary h3-b">
              {nickname || '사용자'}
            </p>
            <p className="text-primary h3">님</p>
          </div>
          <div className="justify-start text-brand font-kr-h2 kr-h2">
            🐾🐾 환영한다냥!! 🐾🐾
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto px-4 pb-20 bg-white">
        <Button btnStyle="filled-red" size="lg" onClick={handleLogout} className="w-full">
          로그아웃
        </Button>
      </div>
    </>
  );
}
