import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { BottomSheet, PageHeader } from '@/components/common';
import { DiscountList } from '@/components/discount';
import { FoocketingList } from '@/components/foocketing';
import { Tab } from '@shared/components/Tab';
import { useShopDetail } from '@/hooks';
import type { ShopDetailDiscount, ShopDetailFoocketing } from '@/types';
import ShopInfoTabs from './components/ShopInfoTabs';
import ShopProfile from './components/ShopProfile';
import MenuDetail from './components/MenuDetail';

export default function ShopDetail() {
  const { id } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopDetailDiscount | ShopDetailFoocketing | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'discount' | 'foocketing' | null>(null);
  const discountSectionRef = useRef<HTMLDivElement>(null);
  const foocketingSectionRef = useRef<HTMLDivElement>(null);

  const {
    shopDetail: detail,
    loading,
    error,
  } = useShopDetail({
    shopId: id ? Number(id) : 0, // id가 없으면 0 (enabled: !!shopId로 쿼리 실행 안됨)
  });

  if (error) {
    console.log('가게 상세 조회 에러:', error);
  }

  if (!detail && !loading) {
    console.log('가게 상세 데이터가 없습니다.');
  }

  // 스크롤 이벤트 감지 (DetailLayout의 스크롤 컨테이너)
  useEffect(() => {
    const handleScroll = () => {
      // DetailLayout의 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector('.h-screen.overflow-y-auto');
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        setIsScrolled(scrollTop > 100); // 100px 이상 스크롤 시 light로 변경
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

  // 탭 클릭 시 해당 섹션으로 스크롤
  const handleTabChange = (index: number) => {
    const scrollContainer = document.querySelector('.h-screen.overflow-y-auto') as HTMLElement;
    const targetElement = index === 0 ? discountSectionRef.current : foocketingSectionRef.current;
    
    if (targetElement && scrollContainer) {
      // 스크롤 컨테이너 내에서의 상대 위치 계산
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = targetElement.getBoundingClientRect();
      const scrollTop = scrollContainer.scrollTop;
      const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 20; // 20px 여백
      
      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    } else if (targetElement) {
      // fallback: window scroll
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 카드 클릭 시 BottomSheet 열기
  const handleDiscountCardClick = (item: ShopDetailDiscount) => {
    setSelectedItem(item);
    setSelectedItemType('discount');
    setIsBottomSheetOpen(true);
  };

  const handleFoocketingCardClick = (item: ShopDetailFoocketing) => {
    setSelectedItem(item);
    setSelectedItemType('foocketing');
    setIsBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  return (
    <>
      {/* Header - 화면 최상단에 고정 */}
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto z-50">
        <PageHeader 
          title={isScrolled ? (detail?.shopName || '가게 상세') : undefined} 
          variant={isScrolled ? 'light' : 'dark'} 
          className="sticky top-0"
        />
      </div>
      
      {loading && <p>로딩 중...</p>}
      
      {(error || !detail) && !loading && (
        <p>페이지를 찾을 수 없습니다</p>
      )}
      
      {detail && !loading && (
        <div className="w-full flex flex-col">
          <ShopProfile
            shopBanner={detail.shopBanner}
            shopName={detail.shopName}
            rating={detail.rating}
            ratingCount={detail.ratingCount}
          />
          {/* 가게 정보 탭 (노쇼 시간, 가게 위치, 가게 소개) */}
          <div className="w-full mt-28">
            <ShopInfoTabs
              shopDescription={detail.shopDescription}
              shopLat={detail.shopLat}
              shopLng={detail.shopLng}
              shopName={detail.shopName}
              shopAddress={detail.shopAddress}
              distanceMeters={detail.distanceMeters}
              shopPickupEndTime={detail.shopPickupEndTime}
            />
          </div>
          
          <div className="pt-3">
            <Tab 
              tabLabels={['마감세일', '푸켓팅']}
              onTabChange={handleTabChange}
            />
          </div>
          
          {/* 마감세일 목록 */}
          {detail.discounts && detail.discounts.length > 0 && (
            <div ref={discountSectionRef} className="flex flex-col pt-3 px-4 items-start gap-3">
              <div className="text-primary h5-b">
                마감세일 중인 메뉴
              </div>
              <DiscountList
                discounts={detail.discounts}
                onCardClick={handleDiscountCardClick}
              />
            </div>
          )}

          {/* 푸켓팅 목록 */}
          {detail.foocketings && detail.foocketings.length > 0 && (
            <div ref={foocketingSectionRef} className="self-stretch pt-3 bg-white flex flex-col justify-start items-start gap-3">
              <div className="text-center justify-start text-black text-lg font-bold font-['Pretendard'] leading-7">
                푸켓팅 중인 메뉴
              </div>
              <FoocketingList
                foocketings={detail.foocketings}
                shopInfo={{
                  name: detail.shopName,
                  distance: detail.distanceMeters / 1000, // 미터를 km로 변환
                  rating: detail.rating,
                  ratingCount: detail.ratingCount,
                }}
                onCardClick={handleFoocketingCardClick}
              />
            </div>
          )}
        </div>
      )}

      {/* BottomSheet */}
      {isBottomSheetOpen && selectedItem && selectedItemType === 'discount' && 'discountRate' in selectedItem && (
        <BottomSheet
          showBackdrop={true}
          onBackdropClick={handleCloseBottomSheet}
        >
          <MenuDetail detail={selectedItem} />
        </BottomSheet>
      )}
    </>
  );
}
