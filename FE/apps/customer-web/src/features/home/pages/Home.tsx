import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFoocketingList } from '@/features/foocketing/hook';
import { Input } from '@shared/components/Input';
import { HomeHeader } from '@/shared/components';
import { FoocketingCard } from '@/features/foocketing/component';
import DiscountCategoryTab from './DiscountCategoryTab';
import { Button } from '@shared/components/Button';
import { Tab } from '@shared/components/Tab';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getRecommendedDiscountList } from '@/features/discount/api';
import { getRecommendedFoocketingList } from '@/features/foocketing/api';
import DiscountList from '@/features/discount/component/DiscountList';
import FoocketingList from '@/features/foocketing/component/FoocketingList';

export default function Home() {
  const navigate = useNavigate();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0); // 0: 마감세일, 1: 푸켓팅

  // 푸켓팅 목록 가져오기 (기본 카테고리 1, 정렬 IMMINENT)
  const { foocketings, loading, error } = useFoocketingList({
    initialCategory: 1,
    sort: 'IMMINENT',
  });

  // 6개만 노출
  const displayedFoocketings = foocketings.slice(0, 6);

  // 마감세일 추천 목록 조회
  const {
    data: recommendedDiscounts,
    isLoading: discountLoading,
    error: discountError,
  } = useQuery({
    queryKey: ['recommended', 'discount'],
    queryFn: () => getRecommendedDiscountList(),
    enabled: selectedTabIndex === 0,
  });

  // 푸켓팅 추천 목록 조회
  const {
    data: recommendedFoocketings,
    isLoading: foocketingLoading,
    error: foocketingError,
  } = useQuery({
    queryKey: ['recommended', 'foocketing'],
    queryFn: () => getRecommendedFoocketingList(),
    enabled: selectedTabIndex === 1,
  });

  const handleMoreClick = () => {
    // 푸켓팅 페이지로 이동
    // Foocketing 페이지에서 자동으로 API 호출됨 (useFoocketingCategory 훅)
    navigate('/foocketing');
  };

  const handleInputClick = () => {
    // Search 페이지로 이동하고 Input이 자동으로 focus되도록 state 전달
    navigate('/search', { state: { shouldFocus: true } });
  };

  const handleTabChange = (index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto z-50">
        <HomeHeader />
      </div>
      <div className="flex flex-col gap-9 px-4 ">
        <div className="flex flex-col gap-6">
          <Input 
            className="mt-12" 
            placeholder="먹고 싶은 음식을 검색해보세요" 
            onClick={handleInputClick}
            readOnly
            icon={<MagnifyingGlassIcon />}
          />
          <DiscountCategoryTab />
        </div>
        {/* Foocketing*/}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="h5-b text-primary">오늘의 푸켓팅</h2>
            <Button btnStyle="ghost" onClick={handleMoreClick} className="px-0">
              더보기
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          {loading && <p className="py-4 text-center text-gray-500">로딩 중...</p>}
          {error && (
            <p className="py-4 text-center text-red-500">
              에러: {error instanceof Error ? error.message : '알 수 없는 에러'}
            </p>
          )}
          {!loading && !error && displayedFoocketings.length === 0 && (
            <p className="py-4 text-center text-gray-500">푸켓팅 메뉴가 없습니다.</p>
          )}
          {!loading && !error && displayedFoocketings.length > 0 && (
            <div className="flex gap-3 overflow-x-auto flex-nowrap -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {displayedFoocketings.map((foocketing) => (
                <FoocketingCard
                  key={foocketing.foocketingId}
                  openTime={foocketing.openTime}
                  menuName={foocketing.menu.name}
                  originalPrice={foocketing.menu.price}
                  shopName={foocketing.shop.name}
                  menuProfileImage={foocketing.menu.photoUrl}
                  distance={foocketing.shop.distance}
                  rating={foocketing.shop.rating}
                  reviewCount={foocketing.shop.ratingCount}
                  discountedPrice={0}
                  onClick={() => navigate(`/foocketing/${foocketing.foocketingId}`)}
                />
              ))}
            </div>
          )}
        </div>
        {/* 추천 목록 */}
        <div className="flex flex-col mt-6">
          <h2 className="h5-b text-primary pb-1">당신을 위한 맞춤 추천</h2>
          <Tab 
            tabLabels={['마감세일', '푸켓팅']} 
            defaultSelectedIndex={selectedTabIndex} 
            onTabChange={(index) => handleTabChange(index)} 
            className="px-0 mb-3"
          />
          
          {/* 마감세일 추천 목록 */}
          {selectedTabIndex === 0 && (
            <>
              {discountLoading && <p className="py-4 text-center text-gray-500">로딩 중...</p>}
              {discountError && (
                <p className="py-4 text-center text-red-500">
                  에러: {discountError instanceof Error ? discountError.message : '알 수 없는 에러'}
                </p>
              )}
              {!discountLoading && !discountError && recommendedDiscounts && recommendedDiscounts.length === 0 && (
                <p className="py-4 text-center text-gray-500">추천 마감세일이 없습니다.</p>
              )}
              {!discountLoading && !discountError && recommendedDiscounts && recommendedDiscounts.length > 0 && (
                <DiscountList
                  discounts={recommendedDiscounts.map(item => item.discount)}
                />
              )}
            </>
          )}

          {/* 푸켓팅 추천 목록 */}
          {selectedTabIndex === 1 && (
            <>
              {foocketingLoading && <p className="py-4 text-center text-gray-500">로딩 중...</p>}
              {foocketingError && (
                <p className="py-4 text-center text-red-500">
                  에러: {foocketingError instanceof Error ? foocketingError.message : '알 수 없는 에러'}
                </p>
              )}
              {!foocketingLoading && !foocketingError && recommendedFoocketings && recommendedFoocketings.length === 0 && (
                <p className="py-4 text-center text-gray-500">추천 푸켓팅이 없습니다.</p>
              )}
              {!foocketingLoading && !foocketingError && recommendedFoocketings && recommendedFoocketings.length > 0 && (
                <FoocketingList
                  foocketings={recommendedFoocketings.map(item => item.foocketing)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

