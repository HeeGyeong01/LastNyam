import { useNavigate } from 'react-router-dom';
import type { FavoriteShop } from '@/features/favorite/type';
import ShopCardHorizontal from './ShopCardHorizontal';

interface ShopListProps {
  shops: FavoriteShop[];
  onCardClick?: (shop: FavoriteShop) => void;
  className?: string;
}

export default function ShopList({
  shops,
  className,
  onCardClick,
}: ShopListProps) {
  const navigate = useNavigate();

  // 거리를 km로 포맷팅
  const formatDistance = (distance: number): string => {
    return `${distance.toFixed(1)} km`;
  };

  // 세일 중인 메뉴를 문자열로 변환
  const formatSaleMenu = (onSaleMenus: string[]): string => {
    if (onSaleMenus.length === 0) {
      return '-';
    }
    return onSaleMenus.join(', ');
  };

  return (
    <div className={`w-full flex flex-col gap-5 ${className}`}>
      {shops.map((shop, index) => {
        const isLast = index === shops.length - 1;
        const borderClass = isLast ? '' : 'border-b border-stroke-subtle';
        
        return (
          <ShopCardHorizontal
            key={shop.shopId}
            className={borderClass}
            storeName={shop.name}
            storeProfileImage={shop.bannerUrl}
            rating={shop.rating}
            reviewCount={shop.ratingCount}
            saleMenu={formatSaleMenu(shop.onSaleMenus)}
            distance={formatDistance(shop.distance)}
            onClick={
              onCardClick
                ? () => onCardClick(shop)
                : () => navigate(`/shop/${shop.shopId}`)
            }
          />
        );
      })}
    </div>
  );
}

