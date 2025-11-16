import { StarIcon } from '@heroicons/react/24/solid';
import { Badge } from '@shared/components/Badge';
import { cn } from '@/lib/utils';
import { getMenuImageUrl } from '@/shared/lib/image';

interface MenuCardProps {
  foodName: string;
  foodDescription: string;
  discountRate: number;
  discountedPrice: number;
  originalPrice: number;
  rating?: number;
  reviewCount?: number;
  storeName?: string;
  remainingQuantity: number;
  foodImage?: string | null;
  onClick?: () => void;
  className?: string;
}

export default function MenuCard({
  foodName,
  foodDescription,
  discountRate,
  discountedPrice,
  originalPrice,
  rating,
  reviewCount,
  storeName,
  remainingQuantity,
  foodImage,
  onClick,
  className = '',
}: MenuCardProps) {
  const formattedDiscountedPrice = discountedPrice.toLocaleString('ko-KR');
  const formattedOriginalPrice = originalPrice.toLocaleString('ko-KR');
  const formattedReviewCount = reviewCount?.toLocaleString('ko-KR');

  return (
    <div
      className={cn('w-full pb-5 flex justify-start items-start gap-3 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 정보 영역 (왼쪽) */}
      <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-2">
        <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
          {/* 남은수량 Badge */}
          <Badge badgeStyle="red">
            {remainingQuantity}개 남았어요
          </Badge>

          {/* 음식이름 */}
          <div className="self-stretch p1-b text-slate-900 line-clamp-1">
            {foodName}
          </div>

          {/* 음식설명 */}
          <div className="self-stretch caption1 text-slate-400 line-clamp-1">
            {foodDescription}
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="self-stretch inline-flex justify-start items-center gap-1">
          <div className="justify-start p2-b text-orange-600 line-clamp-1">
            {discountRate}%
          </div>
          <div className="justify-start p2-b text-slate-900 line-clamp-1">
            {formattedDiscountedPrice}원
          </div>
          <div className="justify-start p3 text-slate-400 line-through line-clamp-1">
            {formattedOriginalPrice}원
          </div>
        </div>

        {/* 별점과 가게이름 */}
        {((rating !== undefined && reviewCount !== undefined) || storeName) && (
          <div className="self-stretch inline-flex justify-start items-center gap-1">
            {rating !== undefined && reviewCount !== undefined && (
              <div className="flex justify-start items-center gap-1">
                <StarIcon className="w-3 h-3 text-brand-subtle" />
                <div className="justify-start caption2 text-slate-400">
                  {rating.toFixed(1)} ({formattedReviewCount})
                </div>
              </div>
            )}
            {storeName && (
              <div className="flex-1 justify-start caption2 text-slate-400 line-clamp-1">
                {storeName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 이미지 영역 (오른쪽) */}
      <div className="w-[88px] h-[88px] relative rounded-lg overflow-hidden flex-shrink-0">
        <img
          className="h-full w-full object-cover object-center"
          alt={foodName}
          src={getMenuImageUrl(foodImage)}
        />
      </div>
    </div>
  );
}

