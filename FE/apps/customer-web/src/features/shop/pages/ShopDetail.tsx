import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PageHeader, BottomSheet } from '@/shared/components';
import { Button } from '@shared/components/Button';
import { DiscountList } from '@/features/discount/component';
import { FoocketingList } from '@/features/foocketing/component';
import { Tab } from '@shared/components/Tab';
import { useShopDetail } from '@/features/shop/hook';
import type { ShopDetailFoocketing } from '@/features/shop/type';
import { ShopInfoTabs, ShopProfile } from '@/features/shop/component';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { addFavorite, removeFavorite } from '@/features/favorite/api/favorite';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartTotalPrice } = useLayout();
  const [isScrolled, setIsScrolled] = useState(false);
  const discountSectionRef = useRef<HTMLDivElement>(null);
  const foocketingSectionRef = useRef<HTMLDivElement>(null);

  // 장바구니에서 온 경우 state 받기
  const fromCart = location.state?.fromCart || false;

  const shopId = id ? Number(id) : 0;
  const userId = useAuthStore((state) => state.userId);
  const requireAuth = useRequireAuth();

  const {
    shopDetail: detail,
    loading,
    error,
    refetch: refetchShopDetail,
  } = useShopDetail({
    shopId,
    userId: userId ?? undefined,
  });

  // 찜하기 mutation
  const addFavoriteMutation = useMutation({
    mutationFn: () => addFavorite(shopId, userId ?? undefined),
    onSuccess: () => {
      // 찜하기 성공 후 shop 상세 정보 다시 가져오기
      refetchShopDetail();
    },
  });

  // 찜취소 mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: () => removeFavorite(shopId, userId ?? undefined),
    onSuccess: () => {
      // 찜취소 성공 후 shop 상세 정보 다시 가져오기
      refetchShopDetail();
    },
  });

  // 찜하기 토글 함수
  const handleFavoriteClick = () => {
    // favorited가 null이면 requireAuth로 감싸서 로그인 체크
    if (detail?.favorited === null) {
      requireAuth(() => {
        // 로그인 후에는 이 페이지로 돌아와서 다시 시도할 수 있음
      });
      return;
    }

    if (!userId) {
      return;
    }

    const currentFavorited = detail?.favorited ?? false;
    if (currentFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  // favorited가 null이면 false로 표시 (UI용)
  const favorited = detail?.favorited ?? false;
  const isFavoritePending = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

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

  // 탭 라벨 동적 생성
  const tabLabels = [];
  const hasDiscounts = detail && detail.discounts && detail.discounts.length > 0;
  const hasFoocketings = detail && detail.foocketings && detail.foocketings.length > 0;
  
  if (hasDiscounts) {
    tabLabels.push('마감세일');
  }
  if (hasFoocketings) {
    tabLabels.push('푸켓팅');
  }

  // 탭 클릭 시 해당 섹션으로 스크롤
  const handleTabChange = (index: number) => {
    const scrollContainer = document.querySelector('.h-screen.overflow-y-auto') as HTMLElement;
    
    // 탭 인덱스에 따라 타겟 섹션 결정
    let targetElement: HTMLDivElement | null = null;
    if (hasDiscounts && hasFoocketings) {
      // 둘 다 있으면: 0 = discount, 1 = foocketing
      targetElement = index === 0 ? discountSectionRef.current : foocketingSectionRef.current;
    } else if (hasDiscounts) {
      // discount만 있으면: 0 = discount
      targetElement = discountSectionRef.current;
    } else if (hasFoocketings) {
      // foocketing만 있으면: 0 = foocketing
      targetElement = foocketingSectionRef.current;
    }
    
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

  const handleFoocketingCardClick = (item: ShopDetailFoocketing) => {
    navigate(`/foocketing/${item.foocketingId}`);
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
            favorited={favorited}
            favoriteCount={detail.favoriteCount}
            onFavoriteClick={handleFavoriteClick}
            isFavoritePending={isFavoritePending}
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
          
          {tabLabels.length > 0 && (
            <div className="pt-3">
              <Tab 
                tabLabels={tabLabels}
                onTabChange={handleTabChange}
              />
            </div>
          )}
          
          {/* 마감세일 목록 */}
          {detail.discounts && detail.discounts.length > 0 && (
          <div>
            <div ref={discountSectionRef} className="flex flex-col pt-3 px-4 items-start gap-3">
              <div className="text-primary h5-b">
                마감세일 중인 메뉴
              </div>
              <DiscountList
                discounts={detail.discounts}
              />
            </div>
            {/* 구분선 */}
            <div className="h-4 bg-bg-2" />
          </div>
            )}

          {/* 푸켓팅 목록 */}
          {detail.foocketings && detail.foocketings.length > 0 && (
            <div ref={foocketingSectionRef} className="flex flex-col pt-3 px-4 items-start gap-3">
              <div className="text-primary h5-b">
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

      {/* 장바구니에서 온 경우 하단 바텀시트 */}
      {fromCart && (
        <BottomSheet showBackdrop={false}>
          <Button
            btnStyle="filled-yellow"
            size="lg"
            className="w-full"
            onClick={() => navigate('/cart')}
          >
            장바구니 보기
            <span className="p1"> | {cartTotalPrice.toLocaleString('ko-KR')}원</span>
          </Button>
        </BottomSheet>
      )}
    </>
  );
}
