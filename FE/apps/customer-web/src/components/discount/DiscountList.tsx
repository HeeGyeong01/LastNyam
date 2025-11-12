import { useNavigate } from 'react-router-dom';
import type { DiscountItem, ShopDetailDiscount } from '@/types';
import { MenuCard } from '@/components/cards';

interface DiscountListProps {
  discounts: DiscountItem[] | ShopDetailDiscount[];
  shopInfo?: {
    rating: number;
    ratingCount: number;
    name: string;
  };
}

export default function DiscountList({
  discounts,
}: DiscountListProps) {
  const navigate = useNavigate();

  // DiscountItem인지 ShopDetailDiscount인지 확인하는 타입 가드
  const isDiscountItem = (item: DiscountItem | ShopDetailDiscount): item is DiscountItem => {
    return 'menuInfo' in item;
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {discounts.map((item) => {
        if (isDiscountItem(item)) {
          // DiscountItem 타입
          return (
            <MenuCard
              className="border-b border-stroke-subtle"
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
              onClick={() => navigate(`/discount/${item.discountId}`)}
            />
          );
        } else {
          // ShopDiscount 타입
          return (
            <MenuCard
              className="border-b border-stroke-subtle"
              key={item.discountId}
              foodName={item.menuName}
              foodDescription={item.menuDescription}
              discountRate={item.discountRate}
              discountedPrice={item.price}
              originalPrice={item.originalPrice}
              remainingQuantity={item.stock}
              foodImage={item.menuImage}
              // onClick={() => navigate(`/discount/${item.discountId}`)}
            />
          );
        }
      })}
    </div>
  );
}
