import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFoocketingDetail } from '@/features/foocketing/api';
import { PageHeader } from '@/shared/components';
import { ShopCardHorizontal } from '@/features/shop/component';
import NaverMap from '@/shared/components/NaverMap';
import lastnyamCatImage from '@/shared/assets/lastnyam-cat.png';
import { Badge } from '@shared/components/Badge';

export default function FoocketingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 푸켓팅 상세 정보 조회
  const {
    data: detail,
    isLoading: loading,
  } = useQuery({
    queryKey: ['foocketing', 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('푸켓팅 ID가 없습니다.');
      }
      return getFoocketingDetail(Number(id));
    },
    enabled: !!id,
  });

  // TODO: API에서 실제 당첨 순위 정보를 받아와야 함
  const winnerRank = 3; // 임시 값

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="푸켓팅"/>
      
      <div className="flex flex-col gap-10 p-4">
        {/* 성공 메시지 카드 */}
        <div className="w-80 p-7 bg-brand-bg-1 rounded-3xl flex flex-col items-center gap-4 mx-auto">
          {/* 제목 */}
          <div className="self-stretch py-2 bg-white rounded-full flex justify-center items-center">
            <div className="text-brand font-kr-h4 text-kr-h4">
              축하해요! 푸켓팅 성공!
            </div>
          </div>
          
          {/* 이미지 및 순위 영역 */}
          <div className="self-stretch rounded-2xl flex flex-col items-center gap-4">
            {/* 고양이 캐릭터 이미지 */}
            <img 
              className="w-28 h-28" 
              src={lastnyamCatImage} 
              alt="성공한 고양이"
              />
            
            {/* 순위 및 메시지 */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-brand font-kr-h1 text-kr-h1">
                {winnerRank}번
              </div>
              <div className="text-brand text-p2-b">
                🔥 째로 득템했어요!🔥
              </div>
            </div>
          </div>
        </div>

        {/* QR 코드 안내 카드 */}
        <div className="w-full rounded-2xl bg-bg-0 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <Badge badgeStyle="red" size="lg">
              NOTICE
            </Badge>
            <p className="text-primary p1-b pt-2">
              음식 수령 시 사장님께 QR을 제시해 주세요
            </p>
            <p className="text-secondary p3">
              QR은 주문내역에서 확인할 수 있습니다
            </p>
          </div>
          <p className="text-brand p3-b">
            픽업 마감시간 이후에는 당첨이 취소되니 꼭 시간 내 방문해주세요!
          </p>
        </div>

        {/* 가게 정보 및 지도 카드 */}
        <div className="w-full p-5 rounded-2xl border border-stroke-subtle flex flex-col gap-4">
          {/* 가게 정보 */}
          <ShopCardHorizontal
            storeName={detail.shop.name}
            storeProfileImage={detail.shop.bannerUrl}
            rating={detail.shop.rating}
            reviewCount={detail.shop.ratingCount}
            saleMenu={detail.menu.name}
            distance={`${detail.shop.distance.toFixed(1)} km`}
            onClick={() => {
              navigate(`/shop/${detail.shop.shopId}`);
            }}
          />
          
          {/* 지도 */}
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <NaverMap
              center={{ lat: detail.shop.lat, lng: detail.shop.lng }}
              markers={[{ lat: detail.shop.lat, lng: detail.shop.lng, title: detail.shop.name }]}
              zoom={16}
              zoomControl={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}

