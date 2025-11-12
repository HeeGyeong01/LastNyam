import { useNavigate } from 'react-router-dom';
import { FoocketingCardHorizontal } from '@/components/cards';
import type { FoocketingItem, ShopDetailFoocketing } from '@/types';

interface FoocketingListProps {
  foocketings: FoocketingItem[] | ShopDetailFoocketing[];
  shopInfo?: {
    name: string;
    distance: number; // km 단위
    rating: number;
    ratingCount: number;
  };
}

export default function FoocketingList({
  foocketings,
  shopInfo,
}: FoocketingListProps) {
  const navigate = useNavigate();

  // FoocketingItem인지 ShopDetailFoocketing인지 확인하는 타입 가드
  const isFoocketingItem = (item: FoocketingItem | ShopDetailFoocketing): item is FoocketingItem => {
    return 'menu' in item;
  };

  return (
    <div className="flex flex-col">
      {foocketings.map((item) => {
        if (isFoocketingItem(item)) {
          // FoocketingItem 타입
          return (
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
          );
        } else {
          // ShopFoocketing 타입
          return (
            <FoocketingCardHorizontal
              key={item.foocketingId}
              openTime={item.openTime}
              menuName={item.menuName}
              originalPrice={item.originalPrice}
              shopName={shopInfo?.name || ''}
              menuProfileImage={item.menuImage}
              distance={shopInfo?.distance || 0}
              rating={shopInfo?.rating || 0}
              reviewCount={shopInfo?.ratingCount || 0}
              discountedPrice={item.price}
              onClick={() => navigate(`/foocketing/${item.foocketingId}`)}
            />
          );
        }
      })}
    </div>
  );
}

