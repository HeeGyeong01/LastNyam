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
      className={cn('flex flex-col w-36 items-start justify-center gap-2 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <div className="relative self-stretch w-full bg-[#e6e6e6] rounded-lg overflow-hidden aspect-square">
        <img
          className="absolute top-[calc(50%_-_72px)] left-[calc(50%_-_72px)] w-36 h-36 object-cover"
          alt={menuName}
          src={menuProfileImage}
        />

        {/* 오픈시간 배지 */}
        <div className="flex w-36 items-center justify-center gap-1 px-0 py-1 absolute left-0 bottom-0 bg-brand-bg-2">
          <div className="relative w-fit p3-b text-brand whitespace-nowrap">
            {openTime}
          </div>
          <div className="relative w-fit p3-b text-brand whitespace-nowrap">
            OPEN
          </div>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col items-start gap-1 relative self-stretch w-full">
        <div className="flex flex-col items-start gap-0.5 relative self-stretch w-full">
          {/* 메뉴명 */}
          <div className="relative self-stretch p1-b text-primary overflow-hidden text-ellipsis line-clamp-1">
            {menuName}
          </div>

          {/* 별점과 가게명 */}
          <div className="flex items-center gap-1 relative self-stretch w-full">
            <div className="inline-flex items-center relative flex-[0_0_auto] gap-1">
              <StarIcon className="w-3 h-3 text-[#F79616]" />
              <div className="relative w-fit caption2 text-tertiary whitespace-nowrap">
                {rating.toFixed(1)} ({formattedReviewCount})
              </div>
            </div>

            <div className="relative flex-1 caption2 text-tertiary overflow-hidden text-ellipsis line-clamp-1">
              {shopName}
            </div>
          </div>
        </div>

        {/* 거리 */}
        <div className="relative self-stretch caption1 text-secondary">
          {distance}
        </div>

        {/* 가격 */}
        <div className="flex items-center gap-1 relative self-stretch w-full">
          <div className="relative w-fit p2-b text-brand whitespace-nowrap overflow-hidden text-ellipsis line-clamp-1">
            {formattedDiscountedPrice}원
          </div>
          <div className="relative w-fit p3 text-secondary line-through whitespace-nowrap overflow-hidden text-ellipsis line-clamp-1">
            {formattedOriginalPrice}원
          </div>
        </div>
      </div>
    </div>
  );
}

