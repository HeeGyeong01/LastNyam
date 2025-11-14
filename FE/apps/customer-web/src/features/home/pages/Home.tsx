import { useNavigate } from 'react-router-dom';
import { useFoocketingList } from '@/features/foocketing/hook';
import { Input } from '@shared/components/Input';
import { HomeHeader } from '@/shared/components';
import { FoocketingCard } from '@/features/foocketing/component';
import DiscountCategoryTab from './DiscountCategoryTab';
import { Button } from '@shared/components/Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const navigate = useNavigate();

  // 푸켓팅 목록 가져오기 (기본 카테고리 1, 정렬 IMMINENT)
  const { foocketings, loading, error } = useFoocketingList({
    initialCategory: 1,
    sort: 'IMMINENT',
  });

  // 6개만 노출
  const displayedFoocketings = foocketings.slice(0, 6);

  const handleMoreClick = () => {
    // 푸켓팅 페이지로 이동
    // Foocketing 페이지에서 자동으로 API 호출됨 (useFoocketingCategory 훅)
    navigate('/foocketing');
  };

  const handleInputClick = () => {
    // Search 페이지로 이동하고 Input이 자동으로 focus되도록 state 전달
    navigate('/search', { state: { shouldFocus: true } });
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20 bg-white max-w-[500px]">
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
            <Button btnStyle="ghost" onClick={handleMoreClick}>
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
      </div>
    </>
  );
}

