import { StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface ShopCardProps {
  storeName: string;
  storeProfileImage: string;
  rating: number;
  reviewCount: number;
  saleMenu: string;
  distance: string;
  onClick?: () => void;
  className?: string;
}

export default function ShopCard({
  storeName,
  storeProfileImage,
  rating,
  reviewCount,
  saleMenu,
  distance,
  onClick,
  className = '',
}: ShopCardProps) {
  const formattedReviewCount = reviewCount.toLocaleString('ko-KR');

  return (
    <div
      className={cn('flex flex-col w-36 items-start justify-center gap-2 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <div className="relative self-stretch w-full rounded-lg overflow-hidden aspect-square">
        <img
          className="h-full w-full object-cover object-center"
          alt={storeName}
          src={storeProfileImage}
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col items-start gap-1 relative self-stretch w-full">
        <div className="flex flex-col items-start gap-0.5 relative self-stretch w-full">
          {/* 가게이름 */}
          <div className="relative self-stretch p1-b text-primary overflow-hidden text-ellipsis line-clamp-1">
            {storeName}
          </div>

          {/* 별점과 리뷰 수 */}
          <div className="inline-flex items-center relative flex-[0_0_auto] gap-1">
            <StarIcon className="w-3 h-3 text-[#F79616]" />
            <p className="relative w-fit p3-b whitespace-nowrap">
              <span className="text-slate-900 p3-b">
                {rating.toFixed(1)}{' '}
              </span>
              <span className="text-[#c3ccd8] p3-b">
                ({formattedReviewCount})
              </span>
            </p>
          </div>
        </div>

        {/* 세일중인메뉴 */}
        <div className="flex items-start gap-1 relative self-stretch w-full">
          <div className="relative w-fit caption1 text-tertiary whitespace-nowrap">
            세일중:
          </div>
          <div className="relative flex-1 caption1 text-tertiary overflow-hidden text-ellipsis line-clamp-1">
            {saleMenu}
          </div>
        </div>
      </div>

      {/* 거리 */}
      <div className="relative w-fit caption1 text-secondary whitespace-nowrap">
        {distance}
      </div>
    </div>
  );
}

