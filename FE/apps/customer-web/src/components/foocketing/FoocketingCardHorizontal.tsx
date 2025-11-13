import { StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { formatTimeToHHmm } from '@/lib/time';

interface FoocketingCardHorizontalProps {
  openTime: string; // ISO 8601 형식 (예: "2025-11-10T14:00:00")
  menuName: string;
  originalPrice: number;
  shopName?: string;
  menuProfileImage: string;
  distance?: number; // km 단위 (예: 1.2)
  rating?: number;
  reviewCount?: number;
  discountedPrice?: number;
  onClick?: () => void;
  className?: string;
}

export default function FoocketingCardHorizontal({
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
}: FoocketingCardHorizontalProps) {
  // 시간 포맷팅 (ISO 8601 → "HH:mm")
  const formattedOpenTime = formatTimeToHHmm(openTime);

  const formattedOriginalPrice = originalPrice.toLocaleString('ko-KR');
  const formattedDiscountedPrice = discountedPrice.toLocaleString('ko-KR');
  const formattedReviewCount = reviewCount?.toLocaleString('ko-KR');

  return (
    <div
      className={cn('flex w-full items-start gap-3 pt-0 pb-5 px-0 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 오픈시간 배지 (왼쪽) */}
      <div className="flex flex-col w-[72px] items-center justify-center gap-0.5 relative self-stretch bg-brand-bg-2 rounded-lg">
        <div className="relative w-fit p2-b text-brand whitespace-nowrap">
          {formattedOpenTime}
        </div>
        <div className="relative w-fit p3-b text-brand whitespace-nowrap">
          OPEN
        </div>
      </div>

      {/* 정보 영역 (가운데) */}
      <div className="flex flex-col items-start gap-1 relative flex-1 grow">
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
                {rating?.toFixed(1)} ({formattedReviewCount ? `(${formattedReviewCount})` : ''})
              </div>
            </div>

            <div className="relative flex-1 caption2 text-tertiary overflow-hidden text-ellipsis line-clamp-1">
              {shopName}
            </div>
          </div>
        </div>

        {/* 거리 */}
        <div className="relative self-stretch caption1 text-secondary">
          {distance}km
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

      {/* 이미지 영역 (오른쪽) */}
      <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden aspect-square">
        <img
          className="h-full w-full object-cover object-center"
          alt={menuName}
          src={menuProfileImage}
        />
      </div>
    </div>
  );
}

