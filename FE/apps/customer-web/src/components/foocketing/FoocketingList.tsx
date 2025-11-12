import { useNavigate } from 'react-router-dom';
import { FoocketingCardHorizontal } from '@/components/cards';
import type { FoocketingItem } from '@/types';

interface FoocketingListProps {
  foocketings: FoocketingItem[];
}

export default function FoocketingList({
  foocketings,
}: FoocketingListProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {foocketings.map((item: FoocketingItem) => (
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
      ))}
    </div>
  );
}

