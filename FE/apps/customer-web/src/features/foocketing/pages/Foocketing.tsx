import { useEffect, useState, useCallback } from 'react';
import { clearLocationCache } from '@/shared/lib/geolocation';
import { useFoocketingList } from '@/features/foocketing/hook';
import NaverMap from '@/shared/components/NaverMap';
import { PageHeader, DraggableBottomSheet } from '@/shared/components';
import { FoocketingList, FoocketingListHeader } from '@/features/foocketing/component';
import { Tab } from '@shared/components/Tab';
import type { FoocketingCategory, FoocketingItem, FoocketingSortType } from '@/features/foocketing/type';

export default function Foocketing() {
  // 페이지 진입 시 위치 정보 캐시 초기화
  useEffect(() => {
    clearLocationCache();
  }, []);

  // 지도 중심 좌표 상태 (지도 이동 시 업데이트)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // 정렬 옵션
  const sortLabels: Record<FoocketingSortType, { label: string; description: string }> = {
    IMMINENT: {
      label: '마감순',
      description: '푸켓팅 시간이 임박한 순으로 정렬됩니다',
    },
    CLOSEST: {
      label: '거리순',
      description: '가까운 거리 순으로 정렬됩니다',
    },
    PRICE: {
      label: '가격순',
      description: '가격이 낮은 순으로 정렬됩니다',
    },
  };
  const [sort, setSort] = useState<FoocketingSortType>('IMMINENT');

  // 푸켓팅 데이터 가져오기
  // mapCenter가 있으면 지도 중심 좌표 사용, 없으면 API 함수에서 자동으로 가져옴
  // sort가 변경되면 queryKey가 변경되어 자동으로 새로운 데이터를 가져옴
  const {
    category,
    foocketings,
    loading,
    error,
    changeCategory,
  } = useFoocketingList({
    sort,
    lat: mapCenter?.lat,
    lng: mapCenter?.lng,
  });

  // 지도 중심 변경 핸들러
  // 디바운싱(api 호출까지 잠시 대기)은 useFoocketingList 훅 내부에서 처리됨
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
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

  // Header와 Tab 높이 (PageHeader: 48px, Tab: 약 48px)
  const HEADER_TAB_HEIGHT = 96;
  return (
    <div className="w-full">
      {/* Header와 Tab은 fixed로 상단 고정 */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white max-w-[500px] mx-auto">
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
        className="fixed z-0 max-w-[500px] mx-auto left-0 right-0" 
        style={{ 
          top: `${HEADER_TAB_HEIGHT}px`,
          bottom: 0,
        }}
      >
        <NaverMap 
          className="w-full h-full"
          markers={foocketings.map((item: FoocketingItem) => ({
            lat: item.shop.lat,
            lng: item.shop.lng,
            title: item.shop.name,
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
          
          {foocketings.length > 0 && (
            <>
              <FoocketingListHeader
                sort={sort}
                sortLabels={sortLabels}
                onSortSelect={setSort} // sort 변경 시 setSort 실행 → useFoocketingList의 queryKey 변경 → API 재요청
              />
              <FoocketingList
                foocketings={foocketings}
              />
            </>
          )}
        </div>
      </DraggableBottomSheet>

    </div>
  );
}
