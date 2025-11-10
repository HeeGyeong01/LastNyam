import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/common';
import { Tab } from '@shared/components/Tab';
import { clearLocationCache } from '@/lib/geolocation';
// import { useFoocketingCategory } from '@/hooks';
import { useFoocketingCategoryMock } from '@/hooks/useFoocketingCategoryMock';
import { FoocketingCardHorizontal } from '@/components/cards';
import type { FoocketingCategory, FoocketingItem, FoocketingSortType } from '@/types';

export default function Foocketing() {
  const navigate = useNavigate();

  // 페이지 진입 시 위치 정보 캐시 초기화
  useEffect(() => {
    clearLocationCache();
  }, []);

  // 푸켓팅 데이터 가져오기 (위치 정보는 API 함수에서 자동으로 가져옴)
  const {
    category,
    foocketings,
    loading,
    error,
    changeCategory,
  } = useFoocketingCategoryMock({
    initialCategory: 1, // 1: 베이커리
    sort: 'IMMINENT',
  });

  // Tab과 연동하기 위한 카테고리 매핑
  // 1: 베이커리, 2: 회/초밥, 3: 김밥/분식, 4: 샐러드/포케, 5: 기타
  const categoryLabels = ['베이커리', '회/초밥', '김밥/분식', '샐러드/포케', '기타'];
  const categoryValues: FoocketingCategory[] = [1, 2, 3, 4, 5];
  const currentTabIndex = categoryValues.indexOf(category);

  const handleTabChange = (index: number) => {
    const newCategory = categoryValues[index];
    changeCategory(newCategory);
  };

  // 현재 시간 상태
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트 (1초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 현재 시간 포맷팅 (17시 38분 42초)
  const formatCurrentTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}시  ${minutes}분  ${seconds}초`;
  };

  // 정렬 옵션
  const sortLabels: Record<FoocketingSortType, string> = {
    IMMINENT: '마감순',
    CLOSEST: '거리순',
    'PRICE ': '가격순',
  };
  const [sort] = useState<FoocketingSortType>('IMMINENT');
  // TODO: 정렬 기능 구현 시 setSort 사용

  // Header와 Tab 높이 (PageHeader: 48px, Tab: 약 48px)
  const HEADER_TAB_HEIGHT = 96;

  // 바텀시트 상태
  const [bottomSheetHeight, setBottomSheetHeight] = useState(536); // 기본 높이 (화면 하단에서 536px)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // 바텀시트 높이 제한
  // 최소: Tab 바로 아래까지 올라갈 수 있는 높이 (화면 높이 - Header/Tab 높이 - 약간의 여유)
  // 최대: 672px (화면 하단에서 672px 위)
  const MIN_HEIGHT = useMemo(() => {
    if (typeof window === 'undefined') return 200;
    // Tab 바로 아래까지 올라갈 수 있도록 (대략 200px 정도)
    return 200;
  }, []);
  const MAX_HEIGHT = 672; // 최대 높이 (화면 하단에서 672px 위)

  // 드래그 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(bottomSheetHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(bottomSheetHeight);
  };

  // 드래그 중
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault(); // 스크롤 방지
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY; // 위로 드래그하면 양수, 아래로 드래그하면 음수
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY;
    const deltaY = startY - currentY; // 위로 드래그하면 양수
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  }, [isDragging, startY, startHeight, MIN_HEIGHT, MAX_HEIGHT]);

  // 드래그 종료
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // API 응답 데이터를 FoocketingCard props로 변환
  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  const formatOpenTime = (openTime: string): string => {
    const date = new Date(openTime);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <>
      {/* Header와 Tab은 fixed로 상단 고정 */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white">
        <PageHeader title="푸켓팅" variant="light" />
        <Tab
          tabLabels={categoryLabels}
          defaultSelectedIndex={currentTabIndex}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Header와 Tab 높이만큼 공간 확보 (스크롤 방지) */}
      <div style={{ height: `${HEADER_TAB_HEIGHT}px` }} />
      
      {/* 지도 영역 (나중에 네이버지도 추가) */}
      <div 
        className="fixed bg-gray-200 z-0" 
        style={{ 
          top: `${HEADER_TAB_HEIGHT}px`,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* 네이버지도가 들어갈 영역 */}
      </div>

      {/* 바텀시트 */}
      <div
        ref={bottomSheetRef}
        className="fixed left-0 right-0 bg-white rounded-t-3xl shadow-lg z-10 transition-transform duration-300"
        style={{
          bottom: 0,
          height: `${bottomSheetHeight}px`,
          maxHeight: `calc(100vh - ${HEADER_TAB_HEIGHT}px)`,
          touchAction: 'none',
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* 바텀시트 내용 */}
        <div className="h-full overflow-y-auto px-4 pb-4">
          {loading && <p>로딩 중...</p>}
          {error && <p>에러: {error.message}</p>}
          
          {foocketings.length > 0 && (
            <div>
              {/* 현재 시간 및 정렬 헤더 */}
              <div className="bg-white flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2">
                {/* 현재 시간 */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <ClockIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-500 text-sm font-bold">현재시간 :</span>
                  </div>
                  <span className="text-slate-900 text-sm font-bold">
                    {formatCurrentTime(currentTime)}
                  </span>
                </div>

                {/* 정렬 옵션 */}
                <button className="flex items-center gap-1 text-slate-500 text-sm font-semibold">
                  <span>{sortLabels[sort]}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 푸켓팅 목록 */}
              <div className="flex flex-col">
                {foocketings.map((item: FoocketingItem) => (
                  <FoocketingCardHorizontal
                    key={item.foocketingId}
                    openTime={formatOpenTime(item.openTime)}
                    menuName={item.menu.name}
                    originalPrice={item.menu.price}
                    shopName={item.shop.name}
                    menuProfileImage={item.menu.photoUrl}
                    distance={formatDistance(item.shop.distance)}
                    rating={item.shop.rating}
                    reviewCount={item.shop.ratingCount}
                    discountedPrice={0}
                    onClick={() => navigate(`/foocketing/${item.foocketingId}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
