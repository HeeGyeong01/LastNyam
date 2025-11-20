import { useNavigate } from 'react-router-dom';
import { FoocketingCardHorizontal } from '.';
import type { FoocketingItem, FoocketingSearchItem } from '../type/foocketing';
import type { ShopDetailFoocketing } from '@/features/shop/type';

interface FoocketingListProps {
  foocketings: FoocketingItem[] | ShopDetailFoocketing[] | FoocketingSearchItem[];
  shopInfo?: {
    name: string;
    distance: number; // km 단위
    rating: number;
    ratingCount: number;
  };
  onCardClick?: (item: ShopDetailFoocketing) => void;
}

export default function FoocketingList({
  foocketings,
  shopInfo,
  onCardClick,
}: FoocketingListProps) {
  const navigate = useNavigate();

  // FoocketingItem인지 ShopDetailFoocketing인지 FoocketingSearchItem인지 확인하는 타입 가드
  const isFoocketingItem = (item: FoocketingItem | ShopDetailFoocketing | FoocketingSearchItem): item is FoocketingItem => {
    return 'menu' in item && 'shopId' in item.shop;
  };

  const isFoocketingSearchItem = (item: FoocketingItem | ShopDetailFoocketing | FoocketingSearchItem): item is FoocketingSearchItem => {
    return 'menu' in item && !('shopId' in item.shop);
  };

  return (
    <div className="flex flex-col w-full">
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
        } else if (isFoocketingSearchItem(item)) {
          // FoocketingSearchItem 타입
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
              onClick={onCardClick ? () => onCardClick(item) : () => navigate(`/foocketing/${item.foocketingId}`)}
            />
          );
        }
      })}
    </div>
  );
}

