import { Input } from '@shared/components/Input';
import { HomeHeader } from '@/components/common';
import { FoocketingCard, FoocketingCardHorizontal, ShopCard, ShopCardHorizontal, MenuCard } from '@/components/cards';

export default function Home() {
  // 테스트용 샘플 데이터
  const sampleData = [
    {
      openTime: '10:00',
      menuName: '맛있는 파스타 세트',
      originalPrice: 800000,
      storeName: '이탈리안 레스토랑',
      storeProfileImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
      distance: '500m',
      rating: 4.7,
      reviewCount: 8888,
      discountedPrice: 0,
    },
    {
      openTime: '11:30',
      menuName: '프리미엄 스테이크',
      originalPrice: 1200000,
      storeName: '스테이크 하우스',
      storeProfileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      distance: '1.2km',
      rating: 4.9,
      reviewCount: 1234,
      discountedPrice: 0,
    },
    {
      openTime: '09:00',
      menuName: '신선한 샐러드 보울',
      originalPrice: 500000,
      storeName: '헬시 카페',
      storeProfileImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
      distance: '300m',
      rating: 4.5,
      reviewCount: 567,
      discountedPrice: 0,
    },
  ];

  // ShopCard 테스트용 샘플 데이터
  const shopData = [
    {
      storeName: '이탈리안 레스토랑',
      storeProfileImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 8888,
      saleMenu: '파스타 세트 50% 할인',
      distance: '500m',
    },
    {
      storeName: '스테이크 하우스',
      storeProfileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 1234,
      saleMenu: '프리미엄 스테이크 특가',
      distance: '1.2km',
    },
    {
      storeName: '헬시 카페',
      storeProfileImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
      rating: 4.5,
      reviewCount: 567,
      saleMenu: '샐러드 보울 세일',
      distance: '300m',
    },
  ];

  // MenuCard 테스트용 샘플 데이터
  const menuData = [
    {
      foodName: '맛있는 파스타 세트',
      foodDescription: '신선한 재료로 만든 크림 파스타와 샐러드',
      discountRate: 88,
      discountedPrice: 800000,
      originalPrice: 8000000,
      rating: 4.7,
      reviewCount: 8888,
      storeName: '이탈리안 레스토랑',
      remainingQuantity: 88,
      foodImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    },
    {
      foodName: '프리미엄 스테이크',
      foodDescription: '한우 등심 스테이크와 사이드 디시',
      discountRate: 75,
      discountedPrice: 1200000,
      originalPrice: 4800000,
      rating: 4.9,
      reviewCount: 1234,
      storeName: '스테이크 하우스',
      remainingQuantity: 15,
      foodImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
    },
    {
      foodName: '신선한 샐러드 보울',
      foodDescription: '다양한 신선한 채소와 과일이 들어간 샐러드',
      discountRate: 50,
      discountedPrice: 500000,
      originalPrice: 1000000,
      rating: 4.5,
      reviewCount: 567,
      storeName: '헬시 카페',
      remainingQuantity: 32,
      foodImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    },
  ];

  return (
    <>
      <HomeHeader />
      <div className="px-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <Input placeholder="Search" className="mb-6" />
        
        {/* FoocketingCard 테스트 */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold">Foocketing 카드 테스트 (Vertical)</h2>
          <div className="flex gap-4 overflow-x-auto flex-nowrap -mx-4 px-4">
            {sampleData.map((data, index) => (
              <FoocketingCard
                key={index}
                openTime={data.openTime}
                menuName={data.menuName}
                originalPrice={data.originalPrice}
                storeName={data.storeName}
                storeProfileImage={data.storeProfileImage}
                distance={data.distance}
                rating={data.rating}
                reviewCount={data.reviewCount}
                discountedPrice={data.discountedPrice}
                onClick={() => console.log('Card clicked:', data.menuName)}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-8">Foocketing 카드 테스트 (Horizontal)</h2>
          <div className="flex flex-col gap-4">
            {sampleData.map((data, index) => (
              <FoocketingCardHorizontal
                key={index}
                openTime={data.openTime}
                menuName={data.menuName}
                originalPrice={data.originalPrice}
                storeName={data.storeName}
                storeProfileImage={data.storeProfileImage}
                distance={data.distance}
                rating={data.rating}
                reviewCount={data.reviewCount}
                discountedPrice={data.discountedPrice}
                onClick={() => console.log('Horizontal Card clicked:', data.menuName)}
                className="p-0"
              />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-8">Shop 카드 테스트 (Vertical)</h2>
          <div className="flex gap-4 overflow-x-auto flex-nowrap -mx-4 px-4">
            {shopData.map((data, index) => (
              <ShopCard
                key={index}
                storeName={data.storeName}
                storeProfileImage={data.storeProfileImage}
                rating={data.rating}
                reviewCount={data.reviewCount}
                saleMenu={data.saleMenu}
                distance={data.distance}
                onClick={() => console.log('Shop Card clicked:', data.storeName)}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-8">Shop 카드 테스트 (Horizontal)</h2>
          <div className="flex flex-col">
            {shopData.map((data, index) => (
              <ShopCardHorizontal
                key={index}
                storeName={data.storeName}
                storeProfileImage={data.storeProfileImage}
                rating={data.rating}
                reviewCount={data.reviewCount}
                saleMenu={data.saleMenu}
                distance={data.distance}
                onClick={() => console.log('Shop Card Horizontal clicked:', data.storeName)}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-8">Menu 카드 테스트</h2>
          <div className="flex flex-col gap-5">
            {menuData.map((data, index) => (
              <MenuCard
                key={index}
                foodName={data.foodName}
                foodDescription={data.foodDescription}
                discountRate={data.discountRate}
                discountedPrice={data.discountedPrice}
                originalPrice={data.originalPrice}
                rating={data.rating}
                reviewCount={data.reviewCount}
                storeName={data.storeName}
                remainingQuantity={data.remainingQuantity}
                foodImage={data.foodImage}
                onClick={() => console.log('Menu Card clicked:', data.foodName)}
                className="border-b border-stroke-subtle"
                />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

