import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearLocationCache } from '@/shared/lib/geolocation';
import { useDiscountList } from '@/features/discount/hook';
import NaverMap from '@/shared/components/NaverMap';
import { PageHeader, DraggableBottomSheet } from '@/shared/components';
import { DiscountList, DiscountListHeader } from '@/features/discount/component';
import { Tab } from '@shared/components/Tab';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import type { DiscountCategory, DiscountItem, DiscountSortType } from '@/features/discount/type';

export default function Discount() {
  const navigate = useNavigate();

  // 페이지 진입 시 위치 정보 캐시 초기화
  useEffect(() => {
    clearLocationCache();
  }, []);

  // 지도 중심 좌표 상태 (지도 이동 시 업데이트)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // 정렬 옵션 (SortBottomSheet에서 관리)
  const [sort, setSort] = useState<DiscountSortType>('FAVORITES');

  // 마감세일 데이터 가져오기
  // mapCenter가 있으면 지도 중심 좌표 사용, 없으면 API 함수에서 자동으로 가져옴
  // sort가 변경되면 queryKey가 변경되어 자동으로 새로운 데이터를 가져옴
  const {
    category,
    discounts,
    loading,
    isLoadingMore,
    error,
    changeCategory,
    hasNextPage,
    loadMore,
  } = useDiscountList({
    sort,
    lat: mapCenter?.lat,
    lng: mapCenter?.lng,
  });

  // 무한스크롤 훅
  const observerTarget = useInfiniteScroll({
    hasNextPage,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  // 지도 중심 변경 핸들러
  // 디바운싱(api 호출까지 잠시 대기)은 useDiscountList 훅 내부에서 처리됨
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  }, []);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback((shopId: string | number) => {
    navigate(`/shop/${shopId}`);
  }, [navigate]);

  // Tab과 연동하기 위한 카테고리 매핑
  // 1: 베이커리, 2: 회/초밥, 3: 김밥/분식, 4: 샐러드/포케, 5: 기타
  const categoryLabels = ['베이커리', '회/초밥', '김밥/분식', '샐러드/포케', '기타'];
  const categoryValues: DiscountCategory[] = [1, 2, 3, 4, 5];
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
        <PageHeader title="마감세일" variant="light" onBack={() => navigate('/')}/>
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
            imageUrl: item.menuInfo.photoUrl,
            id: item.shopInfo.shopId,
          }))}
          onCenterChange={handleMapCenterChange}
          onMarkerClick={handleMarkerClick}
          zoom={14}
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
                onSortSelect={setSort} // sort 변경 시 setSort 실행 → useDiscountList의 queryKey 변경 → API 재요청
              />
              <DiscountList
                discounts={discounts}
              />
              {/* 무한스크롤 감지용 요소 */}
              <div ref={observerTarget} className="h-4" />
              {isLoadingMore && <p className="text-center py-4">더 불러오는 중...</p>}
            </>
          )}
        </div>
      </DraggableBottomSheet>

    </div>
  );
}
