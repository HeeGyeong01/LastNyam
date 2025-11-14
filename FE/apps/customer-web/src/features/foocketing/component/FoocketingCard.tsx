import { StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface FoocketingCardProps {
  openTime: string;
  menuName: string;
  originalPrice: number;
  shopName: string;
  menuProfileImage: string;
  distance: string;
  rating: number;
  reviewCount: number;
  discountedPrice?: number;
  onClick?: () => void;
  className?: string;
}

export default function FoocketingCard({
  openTime,
  menuName,
  originalPrice,
  shopName,
  menuProfileImage,
  distance,
  rating,
  reviewCount,
  discountedPrice = 0,
  onClick,
  className = '',
}: FoocketingCardProps) {
  const formattedOriginalPrice = originalPrice.toLocaleString('ko-KR');
  const formattedDiscountedPrice = discountedPrice.toLocaleString('ko-KR');
  const formattedReviewCount = reviewCount.toLocaleString('ko-KR');

  return (
    <div
      className={cn('flex flex-col w-36 flex-shrink-0 items-start gap-2 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full rounded-lg overflow-hidden aspect-square">
        <img
          className="w-full h-full object-cover"
          alt={menuName}
          src={menuProfileImage}
        />

        {/* 오픈시간 배지 */}
        <div className="flex items-center justify-center gap-1 py-1 absolute left-0 right-0 bottom-0 bg-brand-bg-2">
          <div className="p3-b text-brand whitespace-nowrap">
            {openTime}
          </div>
          <div className="p3-b text-brand whitespace-nowrap">
            OPEN
          </div>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col items-start gap-1 w-full">
        <div className="flex flex-col items-start gap-0.5 w-full">
          {/* 메뉴명 */}
          <div className="p1-b text-primary overflow-hidden text-ellipsis line-clamp-1">
            {menuName}
          </div>

          {/* 별점과 가게명 */}
          <div className="flex items-center gap-1 w-full">
            <div className="flex items-center gap-1">
              <StarIcon className="w-3 h-3 text-brand-subtle" />
              <div className="caption2 text-tertiary whitespace-nowrap">
                {rating.toFixed(1)} ({formattedReviewCount})
              </div>
            </div>

            <div className="flex-1 caption2 text-tertiary overflow-hidden text-ellipsis line-clamp-1">
              {shopName}
            </div>
          </div>
        </div>

        {/* 거리 */}
        <div className="caption1 text-secondary">
          {distance}
        </div>

        {/* 가격 */}
        <div className="flex items-center gap-1 w-full">
          <div className="p2-b text-brand whitespace-nowrap">
            {formattedDiscountedPrice}원
          </div>
          <div className="p3 text-secondary line-through whitespace-nowrap">
            {formattedOriginalPrice}원
          </div>
        </div>
      </div>
    </div>
  );
}

