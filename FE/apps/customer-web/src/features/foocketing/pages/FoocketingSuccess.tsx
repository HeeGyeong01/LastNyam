import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFoocketingDetail } from '@/features/foocketing/api';
import { PageHeader } from '@/shared/components';
import { ShopCardHorizontal } from '@/features/shop/component';
import NaverMap from '@/shared/components/NaverMap';
import lastnyamCatImage from '@/shared/assets/lastnyam-cat.png';

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
    <div className="w-full min-h-screen bg-bg-1">
      <PageHeader title="" showCart={false} />
      
      <div className="flex flex-col gap-6 p-4 pt-6">
        {/* 성공 메시지 카드 */}
        <div className="w-full p-6 rounded-2xl bg-brand-bg-1 flex flex-col items-center gap-4">
          {/* 제목 */}
          <h1 className="text-brand h4-b text-center">
            축하해요! 푸켓팅 성공!
          </h1>
          
          {/* 고양이 캐릭터 이미지 */}
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img 
              src={lastnyamCatImage} 
              alt="성공한 고양이" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 당첨 순위 */}
          <div className="text-brand h2-b">
            {winnerRank}번
          </div>
          
          {/* 메시지 */}
          <div className="text-primary p1 text-center">
            째로 득템했어요!
          </div>
        </div>

        {/* QR 코드 안내 카드 */}
        <div className="w-full p-5 rounded-2xl bg-bg-0 flex flex-col gap-3">
          <div className="text-primary p1-b">
            음식 수령 시 사장님께 QR을 제시해 주세요
          </div>
          <div className="text-secondary p2">
            QR은 주문내역에서 확인할 수 있습니다
          </div>
          <div className="text-error p2">
            ⚠️ 픽업 마감시간 이후에는 당첨이 취소되니 꼭 시간 내 방문해주세요!
          </div>
        </div>

        {/* 가게 정보 및 지도 카드 */}
        <div className="w-full p-5 rounded-2xl bg-bg-0 flex flex-col gap-4">
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
    </div>
  );
}

