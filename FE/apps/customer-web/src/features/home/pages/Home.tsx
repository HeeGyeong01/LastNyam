import { useNavigate } from 'react-router-dom';
import { Input } from '@shared/components/Input';
import { HomeHeader } from '@/shared/components';
import { FoocketingCard } from '@/features/foocketing/component';
import DiscountCategoryTab from './DiscountCategoryTab';
import { Button } from '@shared/components/Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const navigate = useNavigate();

  const handleMoreClick = () => {
    // 푸켓팅 페이지로 이동
    // Foocketing 페이지에서 자동으로 API 호출됨 (useFoocketingCategory 훅)
    navigate('/foocketing');
  };

  // 테스트용 샘플 데이터
  const sampleData = [
    {
      openTime: '10:00',
      menuName: '맛있는 파스타 세트',
      originalPrice: 800000,
      shopName: '이탈리안 레스토랑',
      menuProfileImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
      distance: '500m',
      rating: 4.7,
      reviewCount: 8888,
      discountedPrice: 0,
    },
    {
      openTime: '11:30',
      menuName: '프리미엄 스테이크',
      originalPrice: 1200000,
      shopName: '스테이크 하우스',
      menuProfileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      distance: '1.2km',
      rating: 4.9,
      reviewCount: 1234,
      discountedPrice: 0,
    },
    {
      openTime: '09:00',
      menuName: '신선한 샐러드 보울',
      originalPrice: 500000,
      shopName: '헬시 카페',
      menuProfileImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
      distance: '300m',
      rating: 4.5,
      reviewCount: 567,
      discountedPrice: 0,
    },
  ];

  // // ShopCard 테스트용 샘플 데이터
  // const shopData = [
  //   {
  //     storeName: '이탈리안 레스토랑',
  //     storeProfileImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
  //     rating: 4.7,
  //     reviewCount: 8888,
  //     saleMenu: '파스타 세트 50% 할인',
  //     distance: '500m',
  //   },
  //   {
  //     storeName: '스테이크 하우스',
  //     storeProfileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
  //     rating: 4.9,
  //     reviewCount: 1234,
  //     saleMenu: '프리미엄 스테이크 특가',
  //     distance: '1.2km',
  //   },
  //   {
  //     storeName: '헬시 카페',
  //     storeProfileImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  //     rating: 4.5,
  //     reviewCount: 567,
  //     saleMenu: '샐러드 보울 세일',
  //     distance: '300m',
  //   },
  // ];

  // // MenuCard 테스트용 샘플 데이터
  // const menuData = [
  //   {
  //     foodName: '맛있는 파스타 세트',
  //     foodDescription: '신선한 재료로 만든 크림 파스타와 샐러드',
  //     discountRate: 88,
  //     discountedPrice: 800000,
  //     originalPrice: 8000000,
  //     rating: 4.7,
  //     reviewCount: 8888,
  //     storeName: '이탈리안 레스토랑',
  //     remainingQuantity: 88,
  //     foodImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
  //   },
  //   {
  //     foodName: '프리미엄 스테이크',
  //     foodDescription: '한우 등심 스테이크와 사이드 디시',
  //     discountRate: 75,
  //     discountedPrice: 1200000,
  //     originalPrice: 4800000,
  //     rating: 4.9,
  //     reviewCount: 1234,
  //     storeName: '스테이크 하우스',
  //     remainingQuantity: 15,
  //     foodImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
  //   },
  //   {
  //     foodName: '신선한 샐러드 보울',
  //     foodDescription: '다양한 신선한 채소와 과일이 들어간 샐러드',
  //     discountRate: 50,
  //     discountedPrice: 500000,
  //     originalPrice: 1000000,
  //     rating: 4.5,
  //     reviewCount: 567,
  //     storeName: '헬시 카페',
  //     remainingQuantity: 32,
  //     foodImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  //   },
  // ];

  return (
    <>
      <HomeHeader />
      <div className="flex flex-col gap-9 px-4 ">
        <Input placeholder="Search" className="mb-6" />
        <DiscountCategoryTab />
        {/* Foocketing*/}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">오늘의 푸켓팅</h2>
            <Button btnStyle="ghost" onClick={handleMoreClick}>
              더보기
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto flex-nowrap -mx-4 px-4">
            {sampleData.map((data, index) => (
              <FoocketingCard
                key={index}
                openTime={data.openTime}
                menuName={data.menuName}
                originalPrice={data.originalPrice}
                shopName={data.shopName}
                menuProfileImage={data.menuProfileImage}
                distance={data.distance}
                rating={data.rating}
                reviewCount={data.reviewCount}
                discountedPrice={data.discountedPrice}
                onClick={() => console.log('Card clicked:', data.menuName)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

