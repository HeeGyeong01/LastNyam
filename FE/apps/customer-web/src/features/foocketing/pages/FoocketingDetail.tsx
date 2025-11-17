import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import {
  getFoocketingDetail,
  enterFoocketing,
  getFoocketingResult,
} from '@/features/foocketing/api';
import { Badge } from '@shared/components/Badge';
import { PageHeader, LoadingModal } from '@/shared/components';
import { ShopCardHorizontal } from '@/features/shop/component';
import { BottomSheet } from '@/shared/components';
import NaverMap from '@/shared/components/NaverMap';
import { formatTimeToKorean, formatISOStringToKorean } from '@/shared/lib/time';
import { Button } from '@shared/components/Button';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { useServerTime } from '@/shared/hooks/useServerTime';

export default function FoocketingDetail() {
  const { id } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  // 서버 시간 동기화 훅 사용 (30초마다 서버 시간과 동기화)
  const currentTime = useServerTime(30000);
  const [isWaitingEntry, setIsWaitingEntry] = useState(false);
  const [isWaitingResult, setIsWaitingResult] = useState(false);
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const userId = useAuthStore((state) => state.userId); // userId를 store에서 가져오기

  const {
    data: detail,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['foocketing', 'detail', id, userId], // userId를 queryKey에 포함
    queryFn: () => {
      if (!id) {
        throw new Error('푸켓팅 ID가 없습니다.');
      }
      return getFoocketingDetail(Number(id));
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });

  if (error) {
    console.log('푸켓팅 상세 조회 에러:', error);
  }

  if (!detail && !loading) {
    console.log('푸켓팅 상세 데이터가 없습니다.');
  }

  // 스크롤 이벤트 감지 (MainLayout의 스크롤 컨테이너)
  useEffect(() => {
    const handleScroll = () => {
      // MainLayout의 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector('.h-screen.overflow-y-auto');
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        setIsScrolled(scrollTop > 100); // 100px 이상 스크롤 시 dark로 변경
      } else {
        // fallback: window scroll
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setIsScrolled(scrollTop > 100);
      }
    };

    const scrollContainer = document.querySelector('.h-screen.overflow-y-auto');
    const target = scrollContainer || window;

    target.addEventListener('scroll', handleScroll);
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  // 푸켓팅 참여하기 핸들러
  const handleEnterFoocketing = () => {
    requireAuth(async () => {
      if (!id) {
        return;
      }
      
      try {
        setIsWaitingEntry(true);
        const entryResponse = await enterFoocketing(Number(id));
        setIsWaitingEntry(false);

        // success가 true이면 결과 조회 API 호출
        if (entryResponse.success) {
          setIsWaitingResult(true);
          const result = await getFoocketingResult(Number(id));
          setIsWaitingResult(false);

          // 결과에 따라 성공/실패 페이지로 이동
          if (result.success) {
            navigate(`/foocketing-success/${id}`);
          } else {
            navigate(`/foocketing-fail/${id}`);
          }
        } else {
          alert('푸켓팅 참여에 실패했습니다.');
        }
      } catch (error) {
        console.error('푸켓팅 참여 실패:', error);
        alert('푸켓팅 참여에 실패했습니다. 다시 시도해주세요.');
        setIsWaitingEntry(false);
        setIsWaitingResult(false);
      }
    });
  };

  return (
    <>
      {/* 로딩 모달 - entryResponse 응답 대기 중 */}
      <LoadingModal
        isOpen={isWaitingEntry}
        title="푸켓팅 참여 중입니다"
        message="잠시만 기다려주세요"
      />

      {/* 로딩 모달 - result 응답 대기 중 */}
      <LoadingModal
        isOpen={isWaitingResult}
        title="결과 확인 중입니다"
        message="잠시만 기다려주세요"
      />

      {/* Header - 화면 최상단에 고정, 이미지 위에 겹쳐서 표시 */}
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto z-50">
        <PageHeader
          title="푸켓팅 상세"
          variant={isScrolled ? 'light' : 'dark'}
          className="sticky top-0"
        />
      </div>

      {/* 이미지 - 스크롤 시 같이 움직임 */}
      {detail && !loading && (
        <div className="relative w-full h-40">
          <img
            className="w-full h-full object-cover"
            src={detail.menu.photoUrl || 'https://placehold.co/400x200'}
            alt={detail.menu.name}
          />
          {/* 그라데이션 오버레이 - 위는 어둡고 아래는 투명 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        </div>
      )}

      {/* {loading && <p>로딩 중...</p>} */}

      {(error || !detail) && !loading && <p>페이지를 찾을 수 없습니다</p>}

      {detail && !loading && (
        <div className="w-full inline-flex flex-col justify-center items-start gap-6">
          {/* 컨텐츠 영역 */}
          <div className="w-full p-4 flex flex-col justify-center items-start gap-6">
            {/* 메뉴 정보 섹션 */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              {/* 배지: "3등 안에 들면 성공이에요" */}
              <Badge badgeStyle="red" size="lg">
                {detail.maxAvailable}등 안에 들면 성공이에요
              </Badge>

              {/* 메뉴명 */}
              <div className="text-primary h5-b line-clamp-1">{detail.menu.name}</div>

              {/* 가격 */}
              <div className="flex items-center gap-1">
                <div className="text-brand p1-b">0원</div>
                <div className="text-secondary p2 line-through leading-5 line-clamp-1">
                  {detail.menu.price.toLocaleString()}원
                </div>
              </div>

              {/* 메뉴 설명 */}
              <div className="self-stretch text-secondary p2 whitespace-pre-line">
                {detail.menu.menuDescription}
              </div>
            </div>

            {/* 가게 정보 및 이미지 카드 */}
            <div className="flex flex-col self-stretch p-5 rounded-2xl border border-stroke-subtle justify-start items-start">
              {/* 가게 정보 */}
              <ShopCardHorizontal
                storeName={detail.shop.name}
                storeProfileImage={detail.shop.bannerUrl}
                rating={detail.shop.rating}
                reviewCount={detail.shop.ratingCount}
                saleMenu={detail.menu.name}
                distance={`${detail.shop.distance.toFixed(1)} km`}
                onClick={() => {
                  navigate(`/shop/${detail.shop.shopId}`);
                }}
              />

              {/* 가게 위치 지도 */}
              <div className="self-stretch h-48 rounded-lg overflow-hidden">
                <NaverMap
                  center={{ lat: detail.shop.lat, lng: detail.shop.lng }}
                  markers={[
                    {
                      lat: detail.shop.lat,
                      lng: detail.shop.lng,
                      title: detail.shop.name,
                    },
                  ]}
                  zoom={16}
                  zoomControl={false}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BottomSheet - 하단에 고정 */}
      <BottomSheet>
        <div className="flex flex-col gap-3">
          <div className="text-primary p1-b text-center">
            🔥지금 <span className="text-brand p1-b">{detail?.currentViewing}</span>
            명이 같은 푸드를 노리고 있어요!🔥
          </div>
          <div className="flex gap-2">
            <div className="w-full flex flex-col py-4 bg-bg-2 rounded-2xl items-center gap-0.5">
              <div className="flex items-center gap-0.5">
                <ClockIcon className="w-4 h-4 text-secondary" />
                <span className="text-secondary p2-b">현재 시간</span>
              </div>
              <div className="text-primary h5-b">{formatTimeToKorean(currentTime)}</div>
            </div>
            <div className="w-full flex flex-col py-4 bg-brand-bg-2 rounded-2xl items-center gap-0.5">
              <div className="flex items-center gap-">
                <ClockIcon className="w-4 h-4 text-brand-subtle" />
                <span className="text-brand-subtle p2-b">오픈 시간</span>
              </div>
              <div className="text-brand h5-b">
                {detail?.openTime ? formatISOStringToKorean(detail.openTime) : '-'}
              </div>
            </div>
          </div>
          <Button
            btnStyle="filled-red"
            size="lg"
            onClick={handleEnterFoocketing}
            disabled={isWaitingEntry || isWaitingResult || detail?.hasParticipated !== false}
          >
            {isWaitingEntry || isWaitingResult ? '참여 중...' : '푸켓팅 참여하기'}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
