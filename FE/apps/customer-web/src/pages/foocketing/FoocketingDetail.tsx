import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common';
import { ShopCardHorizontal } from '@/components/cards';
import { getFoocketingDetail } from '@/api/foocketing';
import { Badge } from '@shared/components/Badge';

export default function FoocketingDetail() {
  const { id } = useParams();

  const {
    data: detail,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['foocketing', 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('푸켓팅 ID가 없습니다.');
      }
      return getFoocketingDetail(Number(id));
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });

  if (error) {
    console.log('푸켓팅 상세 조회 에러:', error);
  }

  if (!detail && !loading) {
    console.log('푸켓팅 상세 데이터가 없습니다.');
  }

  return (
    <>
      <PageHeader title="푸켓팅 상세" variant="light" />
      
      {/* {loading && <p>로딩 중...</p>} */}
      
      {(error || !detail) && !loading && (
        <p>페이지를 찾을 수 없습니다</p>
      )}
      
      {detail && !loading && (
        <div className="w-full max-w-96 p-4 bg-white inline-flex flex-col justify-center items-start gap-6">
          {/* 메뉴 정보 섹션 */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {/* 배지: "3등 안에 들면 성공이에요" */}
            <Badge badgeStyle="red">
              {detail.maxAvailable}등 안에 들면 성공이에요
            </Badge>

            {/* 메뉴명 */}
            <div className="self-stretch justify-start text-primary h5-b line-clamp-1">
              {detail.menu.name}
            </div>

            {/* 가격 */}
            <div className="self-stretch inline-flex justify-start items-center gap-1">
              <div className="justify-start text-brand-strong p1-b line-clamp-1">
                0원
              </div>
              <div className="justify-start text-secondary p2 line-through leading-5 line-clamp-1">
                {detail.menu.price.toLocaleString()}원
              </div>
            </div>

            {/* 메뉴 설명 */}
            <div className="self-stretch justify-start text-secondary p2 whitespace-pre-line">
              {detail.menu.menuDescription}
            </div>
          </div>

          {/* 가게 정보 및 이미지 카드 */}
          <div className="self-stretch p-5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-3 flex flex-col justify-start items-start">
            {/* 가게 정보 */}
            <ShopCardHorizontal
              storeName={detail.shop.name}
              storeProfileImage={`https://placehold.co/88x88?text=${encodeURIComponent(detail.shop.name)}`}
              rating={detail.shop.rating}
              reviewCount={detail.shop.ratingCount}
              saleMenu={detail.menu.name}
              distance={`${detail.shop.distance.toFixed(1)} km`}
            />

            {/* 큰 메뉴 이미지 */}
            <div className="self-stretch h-48 relative rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={detail.menu.photoUrl || 'https://placehold.co/400x200'}
                alt={detail.menu.name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

