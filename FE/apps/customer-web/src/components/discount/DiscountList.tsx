import { useNavigate } from 'react-router-dom';
import type { DiscountItem } from '@/types';
import { MenuCard } from '@/components/cards';

interface DiscountListProps {
  discounts: DiscountItem[];
}

export default function DiscountList({
  discounts,
}: DiscountListProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5">
      {discounts.map((item: DiscountItem) => (
        <MenuCard className="border-b border-stroke-subtle"
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
      ))}
    </div>
  );
}
