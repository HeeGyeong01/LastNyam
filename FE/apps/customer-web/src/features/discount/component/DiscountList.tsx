import type { DiscountItem, DiscountSearchItem } from '../type/discount';
import type { ShopDetailDiscount } from '@/features/shop/type';
import { useLayout } from '@/contexts/LayoutContext';
import { DiscountCard } from '.';

interface DiscountListProps {
  discounts: DiscountItem[] | ShopDetailDiscount[] | DiscountSearchItem[];
  shopInfo?: {
    rating: number;
    ratingCount: number;
    name: string;
  };
  onCardClick?: (item: ShopDetailDiscount) => void;
}

export default function DiscountList({
  discounts,
  onCardClick,
}: DiscountListProps) {
  const { openMenuDetail } = useLayout();

  // DiscountItem인지 ShopDetailDiscount인지 DiscountSearchItem인지 확인하는 타입 가드
  const isDiscountItem = (item: DiscountItem | ShopDetailDiscount | DiscountSearchItem): item is DiscountItem => {
    return 'menuInfo' in item && 'description' in item.menuInfo;
  };

  const isDiscountSearchItem = (item: DiscountItem | ShopDetailDiscount | DiscountSearchItem): item is DiscountSearchItem => {
    return 'menuInfo' in item && !('description' in item.menuInfo);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {discounts.map((item, index) => {
        const isLast = index === discounts.length - 1;
        const borderClass = isLast ? '' : 'border-b border-stroke-subtle';
        
        if (isDiscountItem(item)) {
          // DiscountItem 타입 - ShopDetailDiscount로 변환하여 BottomSheet 열기
          const handleClick = () => {
            const converted: ShopDetailDiscount = {
              discountId: item.discountId,
              menuName: item.menuInfo.name,
              originalPrice: item.menuInfo.price,
              discountRate: item.discountRate,
              price: item.discountPrice,
              menuImage: item.menuInfo.photoUrl,
              menuDescription: item.menuInfo.description,
              stock: item.discountAmount,
            };
            openMenuDetail(converted);
          };

          return (
            <DiscountCard
              className={borderClass}
              key={item.discountId}
              foodName={item.menuInfo.name}
              foodDescription={item.menuInfo.description}
              discountRate={item.discountRate}
              discountedPrice={item.discountPrice}
              originalPrice={item.menuInfo.price}
              rating={item.shopInfo.rating}
              reviewCount={item.shopInfo.ratingCount}
              storeName={item.shopInfo.name}
              remainingQuantity={item.discountAmount}
              foodImage={item.menuInfo.photoUrl}
              onClick={handleClick}
            />
          );
        } else if (isDiscountSearchItem(item)) {
          // DiscountSearchItem 타입 - ShopDetailDiscount로 변환하여 BottomSheet 열기
          const handleClick = () => {
            const converted: ShopDetailDiscount = {
              discountId: item.discountId,
              menuName: item.menuInfo.name,
              originalPrice: item.menuInfo.price,
              discountRate: item.discountRate,
              price: item.discountPrice,
              menuImage: item.menuInfo.photoUrl,
              menuDescription: '', // 검색 결과에는 description이 없음
              stock: item.discountAmount,
            };
            openMenuDetail(converted);
          };

          return (
            <DiscountCard
              className={borderClass}
              key={item.discountId}
              foodName={item.menuInfo.name}
              foodDescription="" // 검색 결과에는 description이 없음
              discountRate={item.discountRate}
              discountedPrice={item.discountPrice}
              originalPrice={item.menuInfo.price}
              rating={item.shopInfo.rating}
              reviewCount={item.shopInfo.ratingCount}
              storeName={item.shopInfo.name}
              remainingQuantity={item.discountAmount}
              foodImage={item.menuInfo.photoUrl}
              onClick={handleClick}
            />
          );
        } else {
          // ShopDetailDiscount 타입
          const handleClick = () => {
            if (onCardClick) {
              onCardClick(item);
            } else {
              openMenuDetail(item);
            }
          };

          return (
            <DiscountCard
              className={borderClass}
              key={item.discountId}
              foodName={item.menuName}
              foodDescription={item.menuDescription}
              discountRate={item.discountRate}
              discountedPrice={item.price}
              originalPrice={item.originalPrice}
              remainingQuantity={item.stock}
              foodImage={item.menuImage}
              onClick={handleClick}
            />
          );
        }
      })}
    </div>
  );
}
