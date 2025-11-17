// 가게 이미지 + 가게 프로필

import { PhoneIcon, ShareIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@/shared/assets/icons';
import { getShopBannerUrl } from '@/shared/lib/image';

interface ShopProfileProps {
  shopBanner: string | null;
  shopName: string;
  rating: number;
  ratingCount: number;
  favorited?: boolean; // 찜하기 여부
  onFavoriteClick?: () => void; // 찜하기 버튼 클릭 핸들러
  isFavoritePending?: boolean; // 찜하기 처리 중 여부
}

export default function ShopProfile({
  shopBanner,
  shopName,
  rating,
  ratingCount,
  favorited = false,
  onFavoriteClick,
  isFavoritePending = false,
}: ShopProfileProps) {
  // 디버깅용 콘솔 로그
  console.log('[ShopProfile] 찜 상태:', {
    shopName,
    favorited,
    ratingCount,
    isFavoritePending,
  });
  
  return (
    <div className="relative w-full h-40">
      <img
        className="w-full h-full object-cover"
        src={getShopBannerUrl(shopBanner)}
        alt={shopName}
      />
      {/* 그라데이션 오버레이 - 위는 어둡고 아래는 투명 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      
      {/* 가게 프로필 - 배너 이미지 위에 겹쳐서 배치 */}
      <div className="absolute top-28 left-8 right-8">
        <div className="flex flex-col self-stretch p-5 rounded-2xl bg-bg-0 shadow-lg justify-start items-start gap-4">
          {/* 가게이름 */}
          <div className="flex flex-col w-full gap-1">
            <div className="self-stretch text-center text-primary h4-b">
              {shopName}
            </div>

            {/* 별점과 리뷰 수 */}
            <div className="flex justify-center items-center gap-2">
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-brand-subtle" />
                <span className="text-primary p2-b">{rating.toFixed(1)}</span>
              </div>
              <div className="w-px h-4 bg-stroke-subtle" />
              <span className="text-secondary p2">{ratingCount.toLocaleString('ko-KR')}명 참여</span>
            </div>
          </div>
          {/* 전화, 찜, 공유 버튼 */}
          <div className="flex w-full justify-between pt-5 px-7 border-t border-stroke-subtle">
            <div className="flex items-center gap-1">
              <PhoneIcon className="w-4 h-4 stroke-2 text-tertiary" />
              <span className="text-secondary p2-b">전화</span>
            </div>
            <button
              className="flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onFavoriteClick}
              disabled={isFavoritePending}
            >
              <HeartIcon
                className={`w-5 h-5 stroke-2 ${
                  favorited ? 'text-brand fill-brand' : 'text-tertiary'
                }`}
                fill={favorited ? 'currentColor' : 'none'}
              />
              <span className={`p2-b ${favorited ? 'text-brand' : 'text-secondary'}`}>
                찜하기
              </span>
            </button>
            <div className="flex items-center gap-1">
              <ShareIcon className="w-5 h-5 text-tertiary" />
              <span className="text-secondary p2-b">공유</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

