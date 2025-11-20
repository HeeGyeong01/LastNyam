import { StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { getShopBannerUrl } from '@/shared/lib/image';

interface ShopCardHorizontalProps {
  storeName: string;
  storeProfileImage: string | null;
  rating: number;
  reviewCount: number;
  saleMenu: string;
  distance: string;
  onClick?: () => void;
  className?: string;
}

export default function ShopCardHorizontal({
  storeName,
  storeProfileImage,
  rating,
  reviewCount,
  saleMenu,
  distance,
  onClick,
  className = '',
}: ShopCardHorizontalProps) {
  const formattedReviewCount = reviewCount.toLocaleString('ko-KR');

  return (
    <div
      className={cn('w-full pb-5 inline-flex justify-start items-start gap-3 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden flex-shrink-0 bg-bg-2">
        <img
          className="h-full w-full object-cover object-center"
          alt={storeName}
          src={getShopBannerUrl(storeProfileImage)}
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
            {/* 가게이름 */}
            <div className="self-stretch p1-b text-slate-900 line-clamp-1">
              {storeName}
            </div>

            {/* 별점과 리뷰 수 */}
            <div className="inline-flex justify-start items-center gap-1">
              <StarIcon className="w-3 h-3 text-[#F79616]" />
              <div className="justify-start">
                <span className="text-slate-900 p3-b">
                  {rating.toFixed(1)}{' '}
                </span>
                <span className="text-slate-300 p3-b">
                  ({formattedReviewCount})
                </span>
              </div>
            </div>
          </div>

          {/* 세일중인메뉴 */}
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="justify-start caption1 text-slate-400">
              세일중:
            </div>
            <div className="flex-1 justify-start caption1 text-slate-400 line-clamp-1">
              {saleMenu}
            </div>
          </div>
        </div>

        {/* 거리 */}
        <div className="justify-start caption1 text-slate-500">
          {distance}
        </div>
      </div>
    </div>
  );
}

