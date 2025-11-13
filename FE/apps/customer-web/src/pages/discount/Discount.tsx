import { useEffect, useState, useCallback } from 'react';
import { clearLocationCache } from '@/lib/geolocation';
import { useDiscountList } from '@/hooks';
import NaverMap from '@/components/map/NaverMap';
import { PageHeader, DraggableBottomSheet, BottomSheet } from '@/components/common';
import { DiscountList, DiscountListHeader } from '@/components/discount';
import { Tab } from '@shared/components/Tab';
import type { DiscountCategory, DiscountItem, DiscountSortType } from '@/types';

export default function Discount() {
  // 페이지 진입 시 위치 정보 캐시 초기화
  useEffect(() => {
    clearLocationCache();
  }, []);

  // 지도 중심 좌표 상태 (지도 이동 시 업데이트)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // 마감세일 데이터 가져오기
  // mapCenter가 있으면 지도 중심 좌표 사용, 없으면 API 함수에서 자동으로 가져옴
  const {
    category,
    discounts,
    loading,
    error,
    changeCategory,
  } = useDiscountList({
    sort: 'RATING',
    lat: mapCenter?.lat,
    lng: mapCenter?.lng,
  });

  // 지도 중심 변경 핸들러
  // 디바운싱(api 호출까지 잠시 대기)은 useDiscountList 훅 내부에서 처리됨
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  }, []);

  // Tab과 연동하기 위한 카테고리 매핑
  // 1: 베이커리, 2: 회/초밥, 3: 김밥/분식, 4: 샐러드/포케, 5: 기타
  const categoryLabels = ['베이커리', '회/초밥', '김밥/분식', '샐러드/포케', '기타'];
  const categoryValues: DiscountCategory[] = [1, 2, 3, 4, 5];
  const currentTabIndex = categoryValues.indexOf(category);

  const handleTabChange = (index: number) => {
    const newCategory = categoryValues[index];
    changeCategory(newCategory);
  };

  // 정렬 옵션
  const sortLabels: Record<DiscountSortType, string> = {
    FAVORITES: '찜하기순',
    RATING: '별점순',
    CLOSEST: '거리순',
    DISCOUNT: '할인율순',
    PRICE: '가격순',
  };
  const [sort] = useState<DiscountSortType>('FAVORITES');
  // TODO: 정렬 기능 구현 시 setSort 사용 

  // Header와 Tab 높이 (PageHeader: 48px, Tab: 약 48px)
  const HEADER_TAB_HEIGHT = 96;
  
  const [isSortBottomSheetOpen, setIsSortBottomSheetOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Header와 Tab은 fixed로 상단 고정 */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white max-w-[500px] mx-auto">
        <PageHeader title="마감세일" variant="light" />
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
        className="fixed z-0 max-w-[500px] mx-auto left-0 right-0" 
        style={{ 
          top: `${HEADER_TAB_HEIGHT}px`,
          bottom: 0,
        }}
      >
        <NaverMap 
          className="w-full h-full"
          markers={discounts.map((item: DiscountItem) => ({
            lat: item.shopInfo.lat,
            lng: item.shopInfo.lng,
            title: item.shopInfo.name,
          }))}
          onCenterChange={handleMapCenterChange}
          // 지도 padding 계산 (가려진 영역을 고려한 중심점 조정)
          padding={{ bottom: 224 }}
        />
      </div>

      {/* 바텀시트 */}
      <DraggableBottomSheet
        headerOffset={HEADER_TAB_HEIGHT}
        defaultHeightRatio={0.4}
        className="max-w-[500px] mx-auto"
      >
        <div className="h-full overflow-y-auto px-4 pb-28">
          {loading && <p>로딩 중...</p>}
          {error && <p>에러: {error.message}</p>}
          
          {discounts.length > 0 && (
            <>
              <DiscountListHeader
                sort={sort}
                sortLabels={sortLabels}
                onSortClick={() => {
                  setIsSortBottomSheetOpen(true);
                }}
              />
              <DiscountList
                discounts={discounts}
              />
            </>
          )}
        </div>
      </DraggableBottomSheet>

      {/* 정렬 옵션 바텀시트 */}
      {isSortBottomSheetOpen && (
        <BottomSheet
          showBackdrop={true}
          onBackdropClick={() => setIsSortBottomSheetOpen(false)}
        >
          <div className="p-4">
            <p>정렬 옵션 바텀시트</p>
            <button 
              onClick={() => setIsSortBottomSheetOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded"
            >
              닫기
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
