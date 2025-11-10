import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/common';
import { Tab } from '@shared/components/Tab';
import { clearLocationCache } from '@/lib/geolocation';
import { useFoocketingCategory } from '@/hooks';
// import { useFoocketingCategoryMock } from '@/hooks/useFoocketingCategoryMock';
import { FoocketingCardHorizontal } from '@/components/cards';
import NaverMap from '@/components/map/NaverMap';
import type { FoocketingCategory, FoocketingItem, FoocketingSortType } from '@/types';

export default function Foocketing() {
  const navigate = useNavigate();

  // 페이지 진입 시 위치 정보 캐시 초기화
  useEffect(() => {
    clearLocationCache();
  }, []);

  // 지도 중심 좌표 상태 (지도 이동 시 업데이트)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // 푸켓팅 데이터 가져오기
  // mapCenter가 있으면 지도 중심 좌표 사용, 없으면 API 함수에서 자동으로 가져옴
  const {
    category,
    foocketings,
    loading,
    error,
    changeCategory,
  } = useFoocketingCategory({
    initialCategory: 1, // 1: 베이커리
    sort: 'IMMINENT',
    lat: mapCenter?.lat,
    lng: mapCenter?.lng,
  });

  // 디바운싱을 위한 timeout ref
  const centerChangeTimeoutRef = useRef<number | null>(null);

  // 지도 중심 변경 핸들러 (디바운싱 적용)
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    // 이전 timeout 취소
    if (centerChangeTimeoutRef.current) {
      clearTimeout(centerChangeTimeoutRef.current);
    }

    // 디바운싱: 지도 이동이 끝난 후 500ms 후에 API 호출
    centerChangeTimeoutRef.current = setTimeout(() => {
      setMapCenter({ lat, lng });
    }, 500);
  }, []);

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

  // 화면 높이 상태 (리사이즈 대응)
  const [windowHeight, setWindowHeight] = useState(() => {
    if (typeof window === 'undefined') return 800;
    return window.innerHeight;
  });

  // 화면 리사이즈 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 바텀시트 상태
  // 기본 높이를 MAX_HEIGHT의 약 80% 정도로 설정 (화면이 작으면 조정됨)
  const [bottomSheetHeight, setBottomSheetHeight] = useState(() => {
    if (typeof window === 'undefined') return 536;
    const maxH = window.innerHeight - HEADER_TAB_HEIGHT;
    return Math.min(536, maxH * 0.4); // 536px 또는 최대 높이의 80% 중 작은 값
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // 바텀시트 높이 제한
  // 최소: Tab 바로 아래까지 올라갈 수 있는 높이 (대략 200px)
  // 최대: Tab 바로 아래까지 (화면 높이 - Header/Tab 높이)
  const MIN_HEIGHT = 144; // 최소 높이
  const MAX_HEIGHT = useMemo(() => {
    // 화면 높이에서 Header/Tab 높이를 뺀 값 (Tab 바로 아래까지)
    return windowHeight - HEADER_TAB_HEIGHT;
  }, [windowHeight]);

  // 드래그 시작
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(bottomSheetHeight);
  }, [bottomSheetHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(bottomSheetHeight);
  };

  // 드래그 중
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // cancelable이 true일 때만 preventDefault 호출 (경고 방지)
    if (e.cancelable) {
      e.preventDefault(); // 스크롤 방지
    }
    
    // isDragging 상태를 직접 체크하지 않고, startY가 설정되어 있으면 드래그 중으로 간주
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY; // 위로 드래그하면 양수, 아래로 드래그하면 음수
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  }, [startY, startHeight, MIN_HEIGHT, MAX_HEIGHT]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY;
    const deltaY = startY - currentY; // 위로 드래그하면 양수
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  }, [isDragging, startY, startHeight, MIN_HEIGHT, MAX_HEIGHT]);

  // 스냅 로직: 드래그 종료 시 가장 가까운 높이로 스냅
  const snapToNearest = useCallback((currentHeight: number) => {
    const midPoint = (MIN_HEIGHT + MAX_HEIGHT) / 2;
    
    // 중간 지점을 기준으로 MIN_HEIGHT 또는 MAX_HEIGHT로 스냅
    if (currentHeight < midPoint) {
      setBottomSheetHeight(MIN_HEIGHT);
    } else {
      setBottomSheetHeight(MAX_HEIGHT);
    }
  }, [MIN_HEIGHT, MAX_HEIGHT]);

  // 드래그 종료
  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      // 현재 높이를 기준으로 스냅
      snapToNearest(bottomSheetHeight);
    }
    setIsDragging(false);
    setStartY(0);
    setStartHeight(0);
  }, [isDragging, bottomSheetHeight, snapToNearest]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // 현재 높이를 기준으로 스냅
      snapToNearest(bottomSheetHeight);
    }
    setIsDragging(false);
    setStartY(0);
    setStartHeight(0);
  }, [isDragging, bottomSheetHeight, snapToNearest]);

  // 터치 이벤트 리스너 (passive: false로 등록하여 preventDefault 가능)
  useEffect(() => {
    const handleElement = bottomSheetRef.current;
    if (!handleElement) return;

    // passive: false로 등록하여 preventDefault 가능
    handleElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    handleElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    handleElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      handleElement.removeEventListener('touchstart', handleTouchStart);
      handleElement.removeEventListener('touchmove', handleTouchMove);
      handleElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

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
      
      {/* 지도 영역 */}
      <div 
        className="fixed z-0" 
        style={{ 
          top: `${HEADER_TAB_HEIGHT}px`,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <NaverMap 
          className="w-full h-full"
          markers={foocketings.map((item) => ({
            lat: item.shop.lat,
            lng: item.shop.lng,
            title: item.shop.name,
          }))}
          onCenterChange={handleMapCenterChange}
        />
      </div>

      {/* 바텀시트 */}
      <div
        className="fixed left-0 right-0 bg-white rounded-t-2xl shadow-lg z-10"
        style={{
          bottom: 0,
          height: `${bottomSheetHeight}px`,
          maxHeight: `calc(100vh - ${HEADER_TAB_HEIGHT}px)`,
          touchAction: 'none',
          // 드래그 중이 아닐 때만 transition 적용 (스냅 애니메이션)
          transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 드래그 핸들 */}
        <div
          ref={bottomSheetRef}
          className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none' }}
        >
          {/* <div className="w-12 h-1 bg-bg-3 rounded-full" /> */}
        </div>

        {/* 바텀시트 내용 */}
        <div className="h-full overflow-y-auto px-4 pb-28">
          {loading && <p>로딩 중...</p>}
          {error && <p>에러: {error.message}</p>}
          
          {foocketings.length > 0 && (
            <div>
              {/* 현재 시간 및 정렬 헤더 */}
              <div className="bg-white flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
                {/* 현재 시간 */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <ClockIcon className="w-4 h-4 text-amber-500" />
                    <span className="p2-b text-brand-subtle">현재시간 :</span>
                  </div>
                  <span className="p2-b text-primary">
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
                    openTime={item.openTime}
                    menuName={item.menu.name}
                    originalPrice={item.menu.price}
                    shopName={item.shop.name}
                    menuProfileImage={item.menu.photoUrl}
                    distance={item.shop.distance}
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
